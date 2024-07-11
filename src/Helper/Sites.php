<?php

namespace App\Helper;

use Error;
use Exception;
use InvalidArgumentException;
use PDOException;

class Sites
{
    public function getSites(): array
    {
        return [];
    }

    public function createSite(array $data): array
    {
        try {
            return ['error' => null, 'data' => $data, 'controller' => 'createSite'];
        } catch (Error|Exception|PDOException|InvalidArgumentException $e) {
            return ['error' => $e->getMessage(), 'data' => null, 'controller' => 'createSite'];
        }
    }
}
