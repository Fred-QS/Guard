<?php

namespace App\Helper;

use Transliterator;
use Carbon\Carbon;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class HardWare
{
    public function __construct(private TranslatorInterface $translator)
    {

    }

    public function hashTagger(string $str): string
    {
        $remove_accents = Transliterator::create('NFD; [:Nonspacing Mark:] Remove; NFC')->transliterate($str);
        $remove_spaces = trim(str_replace(' ', '', $remove_accents));
        $remove_slashes = str_replace('/', '', $remove_spaces);
        $remove_minus = str_replace('-', '', $remove_slashes);
        return strtolower($remove_minus);
    }

    public function treeStructure(string $serverDir, string $locale, bool|string $path = false): array
    {
        $dir = ($path === false) ? $serverDir : $path;

        $process = new Process(['find', $dir, '-maxdepth', '1', '-group', 'www-data']);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $scan = $this->filterScan(explode("\n", $process->getOutput()), $dir);
        $stats = [];
        Carbon::setLocale($locale);

        foreach ($scan as $file) {
            $filePath = $dir . '/' . $file;
            $time = filemtime($filePath);
            $date = Carbon::parse($time)->isoFormat('LL');
            if (is_file($filePath) || is_dir($filePath)) {
                $size = null;
                if (is_file($filePath)) {
                    $process = new Process(['du', '-sh', $filePath]);
                    $process->run();
                    if (!$process->isSuccessful()) {
                        throw new ProcessFailedException($process);
                    }
                    $res = $process->getOutput();
                    $size = substr($res, 0, strpos($res, "\t")) . 'o';
                }
                $stats[] = [
                    'name' => $file,
                    'date' => $date,
                    'size' => $size,
                    'isFile' => is_file($filePath),
                    'isDir' => is_dir($filePath),
                    'path' => $filePath,
                    'hash' => is_dir($filePath) ? $this->hashTagger($dir . '/' . $file) : null,
                ];
            }
        }
        return $stats;
    }

    private function filterScan(array $scan, string $dir): array
    {
        $results = [];
        foreach ($scan as $row) {
            if ($row !== $dir) {
                $cleaner = str_replace($dir . '/', '', $row);
                if (strlen($cleaner) > 0) {
                    $results[] = $cleaner;
                }
            }
        }
        sort($results);
        return $results;
    }

    public function getStreamFromServer($cmd, $level = false, $json = false): array
    {
        $output = null;
        $retval = null;
        exec($cmd, $output, $retval);
        $result = ($level === false) ? $output : $output[$level];
        $result = ($json === false) ? $result : json_decode($result, true);
        return ['message' => $retval, 'output' => $result];
    }

    public function formatHardDriveInfos(): array
    {
        $array = [];
        $data = null;
        exec('df -h', $data);
        foreach ($data as $row) {
            $cleanArray = [];
            $clean = explode(' ', $row);
            foreach ($clean as $item) {
                if ($item !== '') {
                    $cleanArray[] = $item;
                }
            }
            $array[] = $cleanArray;
        }
        array_shift($array);
        $final = [];
        $cnt = 0;

        foreach ($array as $item) {
            $final[$cnt]['filesystem'] = ['trad' => ucfirst($this->translator->trans('filesystem')), 'data' => $item[0]];
            $final[$cnt]['size'] = ['trad' => ucfirst($this->translator->trans('size')), 'data' => $item[1]];
            $final[$cnt]['used'] = ['trad' => ucfirst($this->translator->trans('used')), 'data' => $item[2]];
            $final[$cnt]['available'] = ['trad' => ucfirst($this->translator->trans('available')), 'data' => $item[3]];
            $final[$cnt]['percent'] = ['trad' => ucfirst($this->translator->trans('used.percent')), 'data' => (int) str_replace('%', '', $item[4])];
            $final[$cnt]['mounted'] = ['trad' => ucfirst($this->translator->trans('mounted.on')), 'data' => $item[5]];
            $cnt++;
        }

        return $final;
    }

    public function temperatures(): array
    {
        $process = new Process(['sensors']);
        $process->run();
        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
        $array = explode("\n", $process->getOutput());
        $title = array_shift($array);
        if (strlen(end($array)) < 1) {
            array_pop($array);
        }
        return ['title' => $title, 'info' => $array];
    }
}
