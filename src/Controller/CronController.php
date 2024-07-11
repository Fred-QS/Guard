<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\CronTasks;

class CronController extends AbstractController
{
    #[Route('/admin/cron', name: 'app_cron')]
    public function cron(CronTasks $cronTasks, Request $request): Response
    {
        $whoami = $cronTasks->getTerminalUser();
        $tasks = $cronTasks->getTasks($request->getLocale());
        return $this->render('pages/cron.html.twig', compact('tasks', 'whoami'));
    }
}
