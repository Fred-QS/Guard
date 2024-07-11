<?php

namespace App\Twig\Extension;

use App\Twig\Runtime\DrivesExtensionRuntime;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class DrivesExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            // If your filter generates SAFE HTML, you should add a third
            // parameter: ['is_safe' => ['html']]
            // Reference: https://twig.symfony.com/doc/3.x/advanced.html#automatic-escaping
            new TwigFilter('carbon_format_date', [DrivesExtensionRuntime::class, 'carbonFormatDate']),
            new TwigFilter('formatSize', [DrivesExtensionRuntime::class, 'formatSize']),
            new TwigFilter('filter_by_text_type', [DrivesExtensionRuntime::class, 'filterByTextType']),
            new TwigFilter('filter_by_display', [DrivesExtensionRuntime::class, 'filteredByDisplay']),
            new TwigFilter('remove_status', [DrivesExtensionRuntime::class, 'removeStatus']),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('carbon_format_date', [DrivesExtensionRuntime::class, 'carbonFormatDate']),
            new TwigFunction('format_size', [DrivesExtensionRuntime::class, 'formatSize']),
        ];
    }
}
