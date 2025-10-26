import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

type RegisterForm = {
    fname: string;
    lname: string;
    office: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type Office = {
    id: number
    section_div_unit: string
}

type CustomPageProps = {
    offices: Office[]
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        fname: '',
        lname: '',
        office: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const { offices } = usePage<CustomPageProps>().props

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="DILG RO VIII" description="Create an account">
            <Head title="Register" />
            <form className="w-full max-w-5xl mx-auto flex flex-col gap-6 px-4" onSubmit={submit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fname">First Name</Label>
                        <Input
                            id="fname"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="fname"
                            value={data.fname}
                            onChange={(e) => setData('fname', e.target.value)}
                            disabled={processing}
                            placeholder="First name"
                        />
                        <InputError message={errors.fname} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lname">Last Name</Label>
                        <Input
                            id="lname"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="lname"
                            value={data.lname}
                            onChange={(e) => setData('lname', e.target.value)}
                            disabled={processing}
                            placeholder="Last Name"
                        />
                        <InputError message={errors.lname} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="office">Office</Label>
                        <Select
                            value={data.office}
                            onValueChange={(value) => setData("office", value)}
                            disabled={processing}
                        >
                            <SelectTrigger
                                id="office"
                                tabIndex={3}
                                className="w-full"
                            >
                                <SelectValue placeholder="Select Office" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Section/Division/Operating Unit</SelectLabel>
                                    {offices.map((office) => (
                                        <SelectItem key={office.id} value={office.id.toString()}>{office.section_div_unit}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={5}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-center">
                    <Button type="submit" className="flex w-full max-w-40" tabIndex={9} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={10}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
