<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\KernelInterface;
use App\Helper\HardWare;

class ServerStateController extends AbstractController
{
    #[Route('/admin/server-state', name: 'app_server')]
    public function serverState(HardWare $hardware, Request $request, KernelInterface $kernel): Response
    {
        $serverDir = dirname($kernel->getProjectDir());
        $folderTree = $hardware->treeStructure($serverDir, $request->getLocale());
        $isFirst = true;

        $drives = $hardware->formatHardDriveInfos();
        $mainDrive = '/dev/mapper/md0vg-varlv';
        $mainDriveInfos = null;
        $index = null;
        foreach ($drives as $i => $drive) {
            if ($drive['filesystem']['data'] === $mainDrive) {
                $mainDriveInfos = json_encode($drive);
                $index = $i + 1;
                break;
            }
        }

        return $this->render('pages/server-state.html.twig', compact('serverDir', 'folderTree', 'isFirst', 'drives', 'mainDrive', 'mainDriveInfos', 'index'));
    }
}
