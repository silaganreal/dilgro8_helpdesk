<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class TarfLogs extends Model
{
    use Notifiable;

    protected $fillable = [
        'section_div_unit',
        'request_type',
        'equipment_concern',
        'brand',
        'model',
        'property_number',
        'serial_number',
        'specify_equipment_concern',
        'software_assistance',
        'govmail_add',
        'alternative_email',
        'contact_no',
        'document_posting',
        'uploaded_file',
        'problem_description',
        'agreed_date',
        'agreed_time',
        'is_notified',
        'finished_date',
        'finished_time',
        'it_staff',
        'status',
        'remarks',
        'reference_no'
    ];
}
