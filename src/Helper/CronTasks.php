<?php

namespace App\Helper;

use Cron\CronExpression;
use Carbon\Carbon;
use Error;
use ErrorException;
use InvalidArgumentException;
use Lorisleiva\CronTranslator\CronTranslator;

class CronTasks
{
    public function getTasks(string $locale): array
    {
        exec('crontab -l', $output);
        $tasks = array_values(array_filter($output, function ($row) {
            return !str_starts_with($row, '#');
        }));
        return array_map(function ($task) use ($locale) {
            return $this->getDetailsFromExpression($task, $locale);
        }, $tasks);
    }

    private function getDetailsFromExpression(string $expression, string $locale): array
    {
        $split = explode(' ', trim($expression));
        $expression = [];
        for ($i = 0; $i < 5; $i++) {
            if (isset($split[0])) {
                $expression[] = $split[0];
                array_shift($split);
            }
        }
        $message = implode(' ', $split);
        $expression = implode(' ', $expression);
        $cron = new CronExpression($expression);
        Carbon::setLocale($locale);
        return [
            'expression' => $expression,
            'translation' => CronTranslator::translate($expression, 'fr', true),
            'message' => $message,
            'previousRun' => Carbon::parse($cron->getPreviousRunDate()->format('Y-m-d H:i:s'))->isoFormat('LLL'),
            'nextRun' => Carbon::parse($cron->getNextRunDate()->format('Y-m-d H:i:s'))->isoFormat('LLL')
        ];
    }

    public function getTerminalUser(): string
    {
        exec('whoami', $output);
        return $output[0] ?? '';
    }

    public function checkExpressionValidity(string $expression, string $locale): array
    {
        try {
            $details = $this->getDetailsFromExpression($expression, $locale);
            return ['stt' => true, 'details' => $details, 'error' => null];
        } catch (Error|ErrorException|InvalidArgumentException $e) {
            return ['stt' => false, 'details' => $e->getMessage(), 'error' => null];
        }
    }

    public function testExpressionValidity(string $cmd): array
    {
        try {
            exec($cmd, $output);
            return ['data' => $output, 'error' => null];
        } catch (Error|ErrorException|InvalidArgumentException $e) {
            return ['error' => $e->getMessage(), 'data' => null];
        }
    }

    public function createCronTask(string $cmd): array
    {
        try {
            $line = "(crontab -l ; echo \"{$cmd}\") | crontab -";
            exec($line, $output);
            return ['data' => $output, 'error' => null];
        } catch (Error|ErrorException|InvalidArgumentException $e) {
            return ['error' => $e->getMessage(), 'data' => null];
        }
    }

    public function deleteCronTask(string $cmd): array
    {
        try {
            $line = "crontab -l | grep -v \"{$cmd}\" | crontab -";
            exec($line, $output);
            return ['data' => $output, 'error' => null];
        } catch (Error|ErrorException|InvalidArgumentException $e) {
            return ['error' => $e->getMessage(), 'data' => null];
        }
    }
}
