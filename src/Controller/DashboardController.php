<?php

namespace App\Controller;

use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    #[Route('/admin', name: 'app_dashboard')]
    public function dashboard(): Response
    {
        $printServer = null;
        exec('hostname -f', $printServer);
        $printServer = $printServer[0];

        return $this->render('pages/dashboard.html.twig', compact('printServer'));
    }
}
