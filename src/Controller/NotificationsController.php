<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class NotificationsController extends AbstractController
{
    #[Route('/admin/notifications', name: 'app_notifications')]
    public function notifications(): Response
    {
        return $this->render('pages/notifications.html.twig', [
            'controller_name' => 'NotificationsController',
        ]);
    }
}
