<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\Mysql;

class DatabasesController extends AbstractController
{
    #[Route('/admin/databases', name: 'app_databases')]
    public function databases(Mysql $mysql): Response
    {
        $databases = $mysql->showDatabases();
        $tables = !empty($databases) ? $mysql->getDatabase($databases[0]) : [];
        $table = !empty($databases) && !empty($tables) ? $mysql->getTable($databases[0], $tables[0]) : [];
        return $this->render('pages/databases.html.twig', compact('databases', 'tables', 'table'));
    }
}
