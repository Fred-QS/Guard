<?php

namespace App\Helper;

use App\Constant\Database;

class Mysql
{
    private function mysqlCmd(string $cmd): array|string
    {
        $init = sprintf('mysql -u %s -p%s -e ', Database::USER, Database::PWD);
        exec($init . '\'' . $cmd . '\'', $output);
        array_shift($output);
        return $output;
    }

    public function showDatabases(): array
    {
        return $this->mysqlCmd('SHOW DATABASES;');
    }

    public function getDatabase(string $db): array
    {
        return $this->mysqlCmd('USE ' . $db . ';SHOW TABLES;');
    }

    public function getTable(
        string $db,
        string $table,
        int $limit = 10,
        int $page = 1,
        array $order = ['by' => null, 'dir' => 'ASC'],
        array $search = ['in' => null, 'text' => null]
    ): array
    {
        $offset = ($page - 1) * $limit;
        $keys = $this->mysqlCmd("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`=\"{$db}\" AND `TABLE_NAME`=\"{$table}\";");

        $select = [];
        foreach ($keys as $key) {
            $select[] = "\"{$key}\", `" . $key . "`";
        }
        $implode = implode(', ', $select);
        $sel = "JSON_OBJECT({$implode})";

        $where = '';
        if ($search['in'] !== null && $search['text'] !== null) {
            $where = " WHERE {$search['in']} LIKE \"%{$search['text']}%\"";
        }

        $orderLogic = $order['by'] !== null ? ' ORDER BY ' . $order['by'] . ' ' . $order['dir'] : '';
        $orderLogic = strlen($orderLogic) < 1 && !empty($keys) ? ' ORDER BY ' . $keys[0] . ' ' . $order['dir'] : $orderLogic;

        $data = $this->mysqlCmd('USE ' . $db . ';SELECT ' . $sel . ' FROM ' . $table . $where . $orderLogic . ' LIMIT ' . $limit . ' OFFSET ' . $offset . ';');

        $values = array_map(function ($row) {
            $json = json_decode(stripslashes($row), true);
            return array_map(function($col) {
                return $col;
            }, $json);
        }, $data);

        $count = $this->mysqlCmd("SELECT COUNT(id) as total FROM {$db}.{$table}{$where}{$orderLogic};");

        $cols = $this->mysqlCmd("SELECT JSON_OBJECT(\"name\", `COLUMN_NAME`, \"type\", `COLUMN_TYPE`, \"isNullable\", `IS_NULLABLE`, \"default\", `COLUMN_DEFAULT`, \"key\", `COLUMN_KEY`, \"extra\", `EXTRA`, \"comment\", `COLUMN_COMMENT`) as object FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`=\"{$db}\" AND `TABLE_NAME`=\"{$table}\";");

        $columns = array_map(function ($row) {
            return json_decode($row, true);
        }, $cols);

        $total = $count[0] ?? 0;
        $pages = (int) ceil($total / $limit);

        return [
            'db' => $db,
            'name' => $table,
            'columns' => $columns,
            'values' => $values,
            'limit' => $limit,
            'page' => $page,
            'pages' => $pages,
            'previous' => $page <= 1 ? null : $page - 1,
            'next' => $page >= $pages ? null : $page + 1,
            'elements' => count($values),
            'total' => (int) $total,
            'order' => $order['dir'],
            'orderBy' => $order['by'],
            'search' => $search['text'],
            'searchBy' => $search['in']
        ];
    }
}
