<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('portal:about', function (): void {
    $this->info('Service Request Platform Laravel API');
});
