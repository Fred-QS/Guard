<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\Containers;

class ContainersController extends AbstractController
{
    #[Route('/admin/containers', name: 'app_containers')]
    public function containers(Containers $containers, Request $request): Response
    {
        $data = $containers->getDockerContainers($request->getLocale());
        return $this->render('pages/containers.html.twig', compact('data'));
    }
}
