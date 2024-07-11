<?php

namespace App\Helper;

use Carbon\Carbon;
use Error;
use Exception;
use InvalidArgumentException;

class Containers
{
    public function getDockerContainers(
        string $locale,
        int $limit = 10,
        int $page = 1,
        array $order = ['by' => 'CreatedAt', 'dir' => 'ASC'],
        array $search = ['in' => null, 'text' => null]
    ): array
    {
        exec("docker ps --all --no-trunc --format='{{json .}}'", $output);
        Carbon::setLocale($locale);

        $data = array_map(function($row) {
            $line = json_decode($row, true);
            $date = date_create($line['CreatedAt']);
            $line['CreatedAtRaw'] = (int) date_format($date,"YmdHis");
            $line['CreatedAt'] = Carbon::parse($line['CreatedAt'])->isoFormat('LLL');
            return $line;
        },$output);

        $columns = !empty($data) ? array_keys($data[0]) : [];
        $data = $this->applyFilters($data, $search, $order);
        $chunk = array_chunk($data, $limit);

        $values = !empty($chunk) && isset($chunk[$page - 1]) ? $chunk[$page - 1] : [];
        $total = count($data);
        $pages = (int) ceil($total / $limit);

        return [
            'columns' => $columns,
            'values' => $values,
            'limit' => $limit,
            'page' => $page,
            'pages' => $pages,
            'previous' => $page <= 1 ? null : $page - 1,
            'next' => $page >= $pages ? null : $page + 1,
            'elements' => count($data),
            'total' => $total,
            'order' => $order['dir'],
            'orderBy' => $order['by'],
            'search' => $search['text'],
            'searchBy' => $search['in'],
            'display' => [
                'CreatedAt',
                'Image',
                'Names',
                'Networks',
                'Status'
            ]
        ];
    }

    private function applyFilters(array $data, array $search, array $order): array
    {
        $array = [];
        $searchIn = $search['in'];
        $search = $search['text'];
        $orderBy = $order['by'] !== 'CreatedAt' ? $order['by'] : 'CreatedAtRaw';
        $orderBy = $orderBy ?? 'CreatedAtRaw';
        $order = strtolower($order['dir']);

        if ($searchIn !== null && $search !== null) {
            foreach ($data as $row) {
                if (str_contains($row[$searchIn], $search)) {
                    $array[] = $row;
                }
            }
        } else {
            $array = $data;
        }

        $filtered = [];
        foreach ($array as $key => $val) {
            $filtered[$key] = $val[$orderBy];
        }

        $sort = $order === 'asc' ? SORT_ASC : SORT_DESC;
        $type = $orderBy === 'CreatedAtRaw' ? SORT_NUMERIC : SORT_REGULAR;
        array_multisort($filtered, $sort, $type, $array);

        return $array;
    }

    public function containerAction(string $name, string $action): array
    {
        try {
            $cmd = 'docker container ' . $action . ' ' . $name;
            exec($cmd, $output);
            return ['error' => null, 'data' => $output];
        } catch (InvalidArgumentException|Error|Exception $e) {
            return ['error' => $e->getMessage(), 'data' => null];
        }
    }
}
