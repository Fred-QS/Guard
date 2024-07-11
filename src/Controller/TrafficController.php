<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\HardWare;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class TrafficController extends AbstractController
{
    #[Route('/admin/traffic', name: 'app_traffic')]
    public function traffic(HardWare $hardware): Response
    {
        $process = new Process(['hostname', '-f']);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $printServer = str_replace("\n", "", $process->getOutput());

        $rxtx = $hardware->getStreamFromServer('vnstat --json', 0, true);
        $interfaces = $rxtx['output']['interfaces'];
        $mainInterface = 'enp5s0';

        return $this->render('pages/traffic.html.twig', compact('interfaces', 'mainInterface', 'printServer'));
    }
}
