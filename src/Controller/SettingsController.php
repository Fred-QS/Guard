<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SettingsController extends AbstractController
{
    #[Route('/admin/settings', name: 'app_settings')]
    public function settings(): Response
    {
        return $this->render('pages/settings.html.twig', [
            'controller_name' => 'SettingsController',
        ]);
    }
}
