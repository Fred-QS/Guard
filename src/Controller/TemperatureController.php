<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\HardWare;

class TemperatureController extends AbstractController
{
    #[Route('/admin/temperature', name: 'app_temperature')]
    public function temperature(HardWare $hardware): Response
    {
        return $this->render('pages/temperature.html.twig');
    }
}
