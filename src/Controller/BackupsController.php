<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class BackupsController extends AbstractController
{
    #[Route('/admin/backups', name: 'app_backups')]
    public function backups(): Response
    {
        return $this->render('pages/backups.html.twig', [
            'controller_name' => 'BackupsController',
        ]);
    }
}
