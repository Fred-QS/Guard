<?php

namespace App\Twig\Runtime;

use Twig\Extension\RuntimeExtensionInterface;
use Carbon\Carbon;

class DrivesExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct()
    {
        
    }

    public function carbonFormatDate(array $date, string $locale): string
    {
        Carbon::setLocale($locale);
        return Carbon::parse($date['year'] . '-' . $date['month'] . '-' . $date['day'])->setTimezone('Europe/Paris')->isoFormat('LL');
    }

    public function formatSize(int $size, bool $full = false): string|array
    {
        $unit = 'o';
        $format = $size;

        if ($size >= 1024 && $size < 1024 * 1024) {
            $unit = 'Ko';
            $format = number_format($size / 1024, 2, ',', ' ');
        } else if ($size >= (1024 * 1024) && $size < (1024 * 1024 * 1024)) {
            $unit = 'Mo';
            $format = number_format($size / (1024 * 1024), 2, ',', ' ');
        } else if ($size >= (1024 * 1024 * 1024) && $size < (1024 * 1024 * 1024 * 1024)) {
            $unit = 'Go';
            $format = number_format($size / (1024 * 1024 * 1024), 2, ',', ' ');
        } else if ($size >= (1024 * 1024 * 1024 * 1024)) {
            $unit = 'To';
            $format = number_format($size / (1024 * 1024 * 1024 * 1024), 2, ',', ' ');
        }

        $fullSize = $format . ' ' . $unit;

        if ($full === false) {
            return $fullSize;
        }
        return ['size' => $format, 'unit' => $unit];
    }

    public function filterByTextType(array $columns): array
    {
        $cols = [];
        foreach ($columns as $column) {
            if (str_starts_with(strtolower($column['type']), 'varchar')
                || str_contains(strtolower($column['type']), 'text')
                || str_contains(strtolower($column['type']), 'date')
                || str_contains(strtolower($column['type']), 'time')
            ) {
                $cols[] = $column;
            }
        }
        return $cols;
    }

    public function filteredByDisplay(array $values, array $display): array
    {
        $toDisplay = [];
        foreach ($values as $row) {
            $r = [];
            foreach ($display as $key => $column) {
                $r[$column] = $row[$column];
            }
            $toDisplay[] = $r;
        }
        return $toDisplay;
    }

    public function removeStatus(array $array): array
    {
        if (isset($array['Status'])) {
            unset($array['Status']);
        } else {
            if (($key = array_search('Status', $array)) !== false) {
                unset($array[$key]);
            }
        }
        return $array;
    }
}
