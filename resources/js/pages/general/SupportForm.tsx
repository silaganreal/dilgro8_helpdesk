"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";

type TypeOfRequest = {
    id: number
    request_type: string
}

type User = {
    id: number;
    fname: string;
    lname: string;
    sec_div_unit: string;
}

interface SuperAdmin {
    id: number;
    fname: string;
    lname: string;
    css_link: string | null;
}

type Props = {
    request_type: TypeOfRequest[]
    users: User[]
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Support Form",
        href: "/support-form"
    }
]

const SupportForm = () => {
    // const { auth } = usePage().props as any
    const { auth } = usePage<PageProps>().props
    const { request_type } = usePage<Props>().props

    const [open, setOpen] = React.useState(false)
    const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(undefined)

    const [open2, setOpen2] = React.useState(false)
    const [calendarDate2, setCalendarDate2] = React.useState<Date | undefined>(undefined)

    const [open3, setOpen3] = React.useState(false)
    const [calendarDate3, setCalendarDate3] = React.useState<Date | undefined>(undefined)

    const { users = [] } = usePage<{
        users?: User[];
    }>().props;

    const { superadmins = [] } = usePage<{
        superadmins?: SuperAdmin[];
    }>().props;

    const { data, setData, post, processing, errors, reset } = useForm<{
        request_type: string
        equipment_concern: string
        brand: string
        model: string
        property_number: string
        serial_number: string
        specify_equipment_concern: string
        software_assistance: string
        govmail_add: string
        alternative_email: string
        contact_no: string
        document_posting: string
        problem_description: string
        agreed_date: string
        agreed_time: string
        uploaded_file: File | null
        finished_date: string
        finished_time: string
        it_staff: string
        status: string
        remarks: string
        request_date: string
        request_time: string
        requested_by: string
    }>({
        request_type: '',
        equipment_concern: '',
        brand: '',
        model: '',
        property_number: '',
        serial_number: '',
        specify_equipment_concern: '',
        software_assistance: '',
        govmail_add: '',
        alternative_email: '',
        contact_no: '',
        document_posting: '',
        problem_description: '',
        agreed_date: '',
        agreed_time: '',
        uploaded_file: null,
        finished_date: '',
        finished_time: '',
        it_staff: '',
        status: auth?.user?.role === "superadmin" ? "finished" : "pending",
        remarks: auth?.user?.role === "superadmin" ? "Done" : "",
        request_date: '',
        request_time: '',
        requested_by: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        post('/support-form/submit', {
            forceFormData: true,
            onSuccess: () => {
                reset()
                setCalendarDate(undefined)
                setCalendarDate2(undefined)
                setCalendarDate3(undefined)
            },
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Form" />

            {processing && (
                // <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold mb-2 text-yellow-500">Submitting your request...</p>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
                    </div>
                </div>
            )}

            <div className="flex m-4">
                <form className="flex-1 overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="request_type">Type of Request</Label>
                            <Select onValueChange={(value) => setData('request_type', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type of Request" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Type of Request</SelectLabel>
                                        {request_type.map((req) => (
                                            <SelectItem key={req.id} value={req.id.toString()}>
                                                {req.request_type}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {(data.request_type === '1' || data.request_type === '3') && (
                            <>
                            <div className="grid gap-3">
                                <Label htmlFor="equipment_concern">Equipment Concern</Label>
                                <Select onValueChange={(value) => setData('equipment_concern', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Equipment Concern" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Equipment Concern</SelectLabel>
                                            <SelectItem value="Desktop">Desktop</SelectItem>
                                            <SelectItem value="Laptop">Laptop</SelectItem>
                                            <SelectItem value="Printer">Printer (3in1, All-in-1, Lone)</SelectItem>
                                            <SelectItem value="Scanner">Scanner (Standalone)</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(data.equipment_concern) && (
                                <>
                                <div className="grid gap-3">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input id="brand" value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Brand" />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="model">Model</Label>
                                    <Input id="model" value={data.model} onChange={e => setData('model', e.target.value)} placeholder="Model" />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="property_no">Property No.</Label>
                                    <Input id="property_no" value={data.property_number} onChange={e => setData('property_number', e.target.value)} placeholder="Property No." />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="serial_no">Serial No.</Label>
                                    <Input id="serial_no" value={data.serial_number} onChange={e => setData('serial_number', e.target.value)} placeholder="Serial No." />
                                </div>
                                </>
                            )}
                            </>
                        )}

                        {(data.request_type === '4') && (
                            <div className="grid gap-3">
                                <Label htmlFor="software_assistance">Select Software Assisstance</Label>
                                <Select onValueChange={(value) => setData('software_assistance', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Software Assistance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Software Assistance</SelectLabel>
                                            <SelectItem value="Intranet">DILG Portal or System (Intranet)</SelectItem>
                                            <SelectItem value="GDrive">Google Drive</SelectItem>
                                            <SelectItem value="Software">Software Installation</SelectItem>
                                            <SelectItem value="VirtualConferencing">Virtual Conferencing (Zoom, Google Meet etc.)</SelectItem>
                                            <SelectItem value="Others">Others</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(data.request_type === '5') && (
                            <>
                            <div className="grid gap-3">
                                <Label htmlFor="govmail_add">GovMail Address</Label>
                                <Input id="govmail_add" value={data.govmail_add} onChange={e => setData('govmail_add', e.target.value)} placeholder="GovMail Address" />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="alternative_email">Alternative Active Email Address</Label>
                                <Input type="email" id="alternative_email" value={data.alternative_email} onChange={e => setData('alternative_email', e.target.value)} placeholder="Alternative Active Email Address" />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="contact_no">Contact No.</Label>
                                <Input type="number" id="contact_no" value={data.contact_no} onChange={e => setData('contact_no', e.target.value)} placeholder="Contact No." />
                            </div>
                            </>
                        )}

                        {(data.request_type === '8') && (
                            <>
                            <div className="grid gap-3">
                                <Label htmlFor="document_posting">Type of Document Posting</Label>
                                <Select onValueChange={(value) => setData('document_posting', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Type of Document Posting" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Type of Document Posting</SelectLabel>
                                            <SelectItem value="Request for Quotation (RFQ) Only">Request for Quotation (RFQ) Only</SelectItem>
                                            <SelectItem value="Notice of Award (NOA) )Only">Notice of Award (NOA) )Only</SelectItem>
                                            <SelectItem value="Purchase Order (PO) Only">Purchase Order (PO) Only</SelectItem>
                                            <SelectItem value="NOA with PO">NOA with PO</SelectItem>
                                            <SelectItem value="Website Article">Website Article</SelectItem>
                                            <SelectItem value="Website and FB Article">Website and FB Article</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="uploaded_file">Upload Image</Label>
                                <Input type="file" id="uploaded_file" onChange={(e) => setData('uploaded_file', e.target.files?.[0] || null)} />
                            </div>
                            </>
                        )}

                        {(data.request_type) && (
                            <>
                            <div className="grid gap-3">
                                <Label htmlFor="problem_description">Please describe your concern or problem encountered</Label>
                                <Textarea id="problem_description" value={data.problem_description} onChange={e => setData('problem_description', e.target.value)} placeholder="Please describe your concern or problem encountered" />
                            </div>

                            {auth?.user?.role !== 'superadmin' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="w-full flex flex-col gap-3">
                                    <Label htmlFor="agreed_date">Agreed Date <span className="text-muted-foreground text-xs">(If Applicable)</span></Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="agreed_date"
                                                className="w-full justify-between font-normal"
                                                >
                                                {calendarDate ? calendarDate.toLocaleDateString() : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={calendarDate}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setCalendarDate(date)
                                                    setData('agreed_date', date?.toISOString().split('T')[0] || '')
                                                    setOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    <Label htmlFor="agreed_time">Agreed Time <span className="text-muted-foreground text-xs">(If Applicable)</span></Label>
                                    <Input
                                        type="time"
                                        id="agreed_time"
                                        step="60"
                                        value={data.agreed_time}
                                        onChange={e => setData('agreed_time', e.target.value)}
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </div>
                            </div>
                            )}

                            {auth?.user?.role === 'superadmin' && (
                                <>
                                <div className="grid gap-3">
                                    <Label htmlFor="requested_by">Requested by</Label>
                                    <Select onValueChange={(value) => setData('requested_by', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Name of Client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Name of Client</SelectLabel>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={String(user.id)}>
                                                        {user.fname} {user.lname} - <span className="text-muted-foreground text-xs">{user.sec_div_unit}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="w-full flex flex-col gap-3">
                                        <Label htmlFor="request_date">Request Date</Label>
                                        <Popover open={open3} onOpenChange={setOpen3}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="request_date"
                                                    className="w-full justify-between font-normal"
                                                    >
                                                    {calendarDate3 ? calendarDate3.toLocaleDateString() : "Select date"}
                                                    <ChevronDownIcon />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={calendarDate3}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (!date) return

                                                        const yyyy = date.getFullYear()
                                                        const mm = String(date.getMonth() + 1).padStart(2, '0')
                                                        const dd = String(date.getDate()).padStart(2, '0')

                                                        setCalendarDate3(date)
                                                        setData('request_date', `${yyyy}-${mm}-${dd}`)
                                                        setOpen3(false)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="w-full flex flex-col gap-3">
                                        <Label htmlFor="request_time">Request Time</Label>
                                        <Input
                                            type="time"
                                            id="request_time"
                                            step="60"
                                            value={data.request_time}
                                            onChange={e => setData('request_time', e.target.value)}
                                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="w-full flex flex-col gap-3">
                                        <Label htmlFor="finished_date">Date Finished</Label>
                                        <Popover open={open2} onOpenChange={setOpen2}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="finished_date"
                                                    className="w-full justify-between font-normal"
                                                    >
                                                    {calendarDate2 ? calendarDate2.toLocaleDateString() : "Select date"}
                                                    <ChevronDownIcon />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={calendarDate2}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (!date) return

                                                        const yyyy = date.getFullYear()
                                                        const mm = String(date.getMonth() + 1).padStart(2, '0')
                                                        const dd = String(date.getDate()).padStart(2, '0')

                                                        setCalendarDate2(date)
                                                        setData('finished_date', `${yyyy}-${mm}-${dd}`)
                                                        setOpen2(false)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="w-full flex flex-col gap-3">
                                        <Label htmlFor="finished_time">Time Finished</Label>
                                        <Input
                                            type="time"
                                            id="finished_time"
                                            step="60"
                                            value={data.finished_time}
                                            onChange={e => setData('finished_time', e.target.value)}
                                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="it_staff">Assigned IT Staff</Label>
                                    <Select onValueChange={(value) => setData('it_staff', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Assigned IT Staff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Assigned IT Staff</SelectLabel>
                                                {superadmins.map((user) => (
                                                    <SelectItem key={user.id} value={String(user.id)}>
                                                        {user.fname} {user.lname}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                </>
                            )}

                            </>
                        )}
                    </div>

                    {(data.request_type) && (
                        <div className="flex items-center justify-center my-10">
                            <Button type="submit" disabled={processing}>Submit Request</Button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    )
}

export default SupportForm
