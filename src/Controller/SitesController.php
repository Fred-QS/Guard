<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Helper\Mysql;
use App\Helper\Sites;
use App\Enum\SiteTypeEnum;

class SitesController extends AbstractController
{
    #[Route('/admin/sites', name: 'app_sites')]
    public function sites(Mysql $mysql, Sites $sites): Response
    {
        $databases = $mysql->showDatabases();
        $siteTypes = SiteTypeEnum::cases();
        $data = $sites->getSites();
        return $this->render('pages/sites.html.twig', compact('databases', 'siteTypes', 'data'));
    }
}
