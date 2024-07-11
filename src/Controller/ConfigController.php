<?php

namespace App\Controller;

use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class ConfigController extends AbstractController
{
    #[Route('/admin/configuration', name: 'app_configuration')]
    public function config(): Response
    {
        $process = new Process(['hostname', '-f']);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $printServer = $process->getOutput();

        $process = new Process(['lshw', '-json']);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $serverHW = $process->getOutput();
        $config = json_decode($serverHW, true);

        return $this->render('pages/config.html.twig', compact('printServer', 'config'));
    }

    private function serverInfosHW(array $data, bool $first = true): string
    {
        $html = '';
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $html .= ($first === false) ? '<div class="server-list-container">' : '<div id="first-server-list-container">';
                if ($first === false) {
                    $html .= ((int)$key || $key === 0) ? '<span class="server-children bold">' . $key + 1 . '</span>' : '<p class="bold green">' . $key . ' :</p>';
                } else {
                    $html .= '';
                }
                $html .= ($first === false) ? '<ul class="server-list">' : '<ul>';
                $html .= $this->serverInfosHW($value, false);
                $html .= '</ul>';
                $html .= '</div>';
            } else {
                $html .= '<li><b class="bold blue">' . $key . ' :</b> ' . $value . '</li>';
            }
        }
        dump($data);
        return $html;
    }
}
