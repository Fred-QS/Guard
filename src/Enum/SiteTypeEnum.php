<?php

namespace App\Enum;

enum SiteTypeEnum: string
{
    case HTML = 'html';
    case PHP = 'php';
    case WORDPRESS = 'wordpress';
    case SYMFONY = 'symfony';
    case LARAVEL = 'laravel';
    case NODE = 'node';
    case REACT = 'react';
    case VUE = 'vue.js';
    case ANGULAR = 'angular.js';
    case NEXT = 'next.js';
    case NUXT = 'nuxt.js';
    case STRAPI = 'strapi';
    case OTHER = 'sites.type.other';
}
