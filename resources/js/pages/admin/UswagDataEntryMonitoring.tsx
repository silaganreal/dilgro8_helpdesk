import InputError from "@/components/input-error"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'USWAG Data Entry & Monitoring',
        href: '/admin/uswag-data-entry-and-monitoring'
    }
]

const Users = () => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="USWAG Data Entry & Monitoring" />
        <form className="w-full max-w-5xl mx-auto flex flex-col gap-6 px-4" >
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
                            value=""
                            placeholder="First name"
                        />
                        <InputError message={'Error'} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lname">Last Name</Label>
                        <Input
                            id="lname"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="lname"
                            value={'data.lname'}
                            placeholder="Last Name"
                        />
                        <InputError message={'Error'} className="mt-2" />
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-center">
                    <Button type="submit" className="flex w-full max-w-40" tabIndex={9}>
                        {/* {processing && <LoaderCircle className="h-4 w-4 animate-spin" />} */}
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
    </AppLayout>
  )
}

export default Users
