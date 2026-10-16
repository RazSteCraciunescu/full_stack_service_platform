<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$directories = [
    $root . '/services/php-webhook',
    $root . '/services/laravel-api',
];
$files = [];

foreach ($directories as $directory) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS),
    );
    foreach ($iterator as $file) {
        if (!$file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }
        if (str_contains(str_replace('\\', '/', $file->getPathname()), '/vendor/')) {
            continue;
        }
        $files[] = $file->getPathname();
    }
}

sort($files);
foreach ($files as $file) {
    $command = escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($file);
    exec($command, $output, $status);
    if ($status !== 0) {
        fwrite(STDERR, implode(PHP_EOL, $output) . PHP_EOL);
        exit($status);
    }
    $output = [];
}

printf("PHP syntax passed for %d files.\n", count($files));
