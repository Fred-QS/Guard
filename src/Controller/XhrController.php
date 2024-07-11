<?php

namespace App\Controller;

use Error;
use ErrorException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\HardWare;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use App\Helper\Mysql;
use App\Helper\CronTasks;
use App\Helper\Containers;
use App\Helper\Sites;

class XhrController extends AbstractController
{
    public function __construct(
        private HardWare $hardware,
        private KernelInterface $kernel,
        private Mysql $mysql,
        private CronTasks $cronTasks,
        private Containers $containers,
        private Sites $sites
    )
    {

    }

    #[Route('/admin/xhr', name: 'app_xhr', methods: ['POST'])]
    public function xhrParser(Request $request, TranslatorInterface $translator): Response
    {
        $json = ['data' => null, 'error' => ucfirst($translator->trans('xhr.error')) . '...'];

        if ($request->request->has("controller")) {

            $result = match ($request->request->get('controller')) {
                'treeStructure' => $this->treeStructure($request),
                'traffic' => $this->traffic($request),
                'drives' => $this->drives($request),
                'temperatures' => $this->temperatures(),
                'database' => $this->database($request, $translator),
                'checkCronExpression' => $this->checkCronExpression($request),
                'testCronExpression' => $this->testCronExpression($request),
                'createCronTask' => $this->createCronTask($request),
                'deleteCronTask' => $this->deleteCronTask($request),
                'containers' => $this->getContainersList($request),
                'containerDetails' => $this->getContainerDetails($request),
                'containerAction' => $this->containerAction($request),
                'createSite' => $this->createSite($request),
                default => null,
            };

            $json = $result;
        }

        return $this->json($json);
    }

    private function treeStructure(Request $request): array
    {
        try {
            $type = $request->request->get('type');
            $path = $request->request->get('path');
            $hash = $request->request->get('hash');
            $path = $type === 'return' ? dirname($path) : $path;
            $serverDir = dirname($this->kernel->getProjectDir());
            $isFirst = $path === $serverDir;
            $folderTree = $type === 'folder' || $type === 'return'
                ? $this->hardware->treeStructure($path, $request->getLocale())
                : file_get_contents($path);
            return ['data' => [
                'dom' => $type === 'folder' || $type === 'return'
                    ? $this->render(
                        'xhr/folder-tree.html.twig',
                        compact('folderTree', 'path', 'isFirst')
                    )->getContent()
                    : htmlentities($folderTree),
                'hash' => $hash,
                'type' => $type,
                'extension' => $type === 'file' ? pathinfo($path, PATHINFO_EXTENSION) : null,
                'name' => basename($path)
            ], 'error' => null];
        } catch (Error|ErrorException $e) {
            return ['error' => $e, 'data' => null];
        }
    }

    private function traffic(Request $request): array
    {
        $mainInterface = $request->request->get('interface');
        $index = $request->request->getInt('index');
        $rxtx = $this->hardware->getStreamFromServer('vnstat --json', 0, true);
        $interfaces = $rxtx['output']['interfaces'];
        return [
            'data' => [
                'dom' => $this->render(
                    'xhr/traffic-details.html.twig',
                    compact('interfaces', 'mainInterface', 'index')
                )->getContent(),
                'interfaces' => $interfaces,
                'index' => $index - 1
            ],
            'error' => null
        ];
    }

    private function drives(Request $request): array
    {
        $drives = $this->hardware->formatHardDriveInfos();
        $mainDrive = $request->request->get('drive');
        $index = $request->request->getInt('index');
        return [
            'data' => [
                'dom' => $this->render(
                    'xhr/drive-list.html.twig',
                    compact('drives', 'mainDrive', 'index')
                )->getContent(),
                'drives' => $drives,
                'index' => $index - 1
            ],
            'error' => null
        ];
    }

    private function temperatures(): array
    {
        $temperatures = $this->hardware->temperatures();
        return ['data' => $temperatures, 'error' => null];
    }

    private function database(Request $request, TranslatorInterface $translator): array
    {
        $type = $request->request->get('type');
        $database = $request->request->get('db');
        $t = $request->request->get('table');
        $params = json_decode($request->request->get('params'), true);

        if ($type === 'db') {
            $tables = $this->mysql->getDatabase($database);
            $table = isset($tables[0]) ? $this->mysql->getTable($database, $tables[0]) : [];
            return [
                'data' => [
                    'dom1' => $this->render(
                        'xhr/db-list.html.twig',
                        compact('database', 'tables')
                    )->getContent(),
                    'dom2' => $table !== null ? $this->render(
                        'xhr/db-table.html.twig',
                        compact('table')
                    )->getContent() : null
                ],
                'error' => null
            ];
        } else if ($type === 'table') {
            $table = $this->mysql->getTable($database, $t);
            return [
                'data' => [
                    'dom1' => null,
                    'dom2' => $this->render(
                        'xhr/db-table.html.twig',
                        compact('table')
                    )->getContent()
                ],
                'error' => null
            ];
        } else if ($type === 'search') {
            $table = $this->mysql->getTable(
                $database,
                $t,
                $params['limit'],
                $params['page'],
                $params['order'],
                $params['search']
            );
            return [
                'data' => [
                    'dom1' => null,
                    'dom2' => $this->render(
                        'xhr/db-table.html.twig',
                        compact('table')
                    )->getContent()
                ],
                'error' => null
            ];
        }

        return ['data' => null, 'error' => ucfirst($translator->trans('xhr.error')) . '...'];
    }

    public function checkCronExpression(Request $request): array
    {
        $check = $this->cronTasks->checkExpressionValidity($request->request->get('expression'), $request->getLocale());
        $check['html'] = $check['error'] === null
            ? $this->render(
            'xhr/cron-preview.html.twig',
            compact('check')
        )->getContent()
            : null;
        return $check;
    }

    public function testCronExpression(Request $request): array
    {
        $cmd = $request->request->get('cmd');
        $test = $this->cronTasks->testExpressionValidity($cmd);
        $data = $test['data'];
        $error = $test['error'];
        return ['data' => $test['data'], 'html' => $this->render(
            'xhr/cron-test.html.twig',
            compact('data', 'error')
        )->getContent(), 'error' => $test['error']];
    }

    public function createCronTask(Request $request): array
    {
        $cmd = $request->request->get('cmd');
        return $this->cronTasks->createCronTask($cmd);
    }

    public function deleteCronTask(Request $request): array
    {
        $cmd = $request->request->get('cmd');
        return $this->cronTasks->deleteCronTask($cmd);
    }

    public function getContainersList(Request $request, ?array $cmd = null): array
    {
        $type = $request->request->get('type');
        $params = json_decode($request->request->get('params'), true);

        $data = $this->containers->getDockerContainers(
            $request->getLocale(),
            $params['limit'],
            $params['page'],
            $params['order'],
            $params['search']
        );
        return [
            'data' => [
                'dom' => $this->render(
                    'xhr/containers-list.html.twig',
                    compact('data')
                )->getContent(),
                'total' => $data['total'],
                'cmd' => $cmd
            ],
            'error' => null
        ];
    }

    public function getContainerDetails(Request $request): array
    {
        $data = json_decode($request->request->get('json'), true);
        return [
            'data' => [
                'dom' => $this->render(
                    'xhr/container-details.html.twig',
                    compact('data')
                )->getContent()
            ],
            'error' => null
        ];
    }

    public function containerAction(Request $request): array
    {
        $params = json_decode($request->request->get('params'), true);
        $action = $params['action'];
        $containerName = $params['containerName'];
        $cmd = $this->containers->containerAction($containerName, $action);
        return $this->getContainersList($request, $cmd);
    }
    
    public function createSite(Request $request): array
    {
        $data = json_decode($request->request->get('data'), true);
        return $this->sites->createSite($data);
    }
}
