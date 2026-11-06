import Logo from '@/components/Logo'

// Shown on login and signup, because that's where a new visitor first meets the product.
export default function AuthMasthead() {
    return (
        <div className="text-center">
            <Logo className="text-6xl" />
            <p className="mt-2 italic text-ink">Just enough CRM</p>
            <p className="mt-4 text-ink">Keep track of your clients, tasks and notes in one place.</p>
        </div>
    )
}
