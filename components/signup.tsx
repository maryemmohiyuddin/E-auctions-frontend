'use client'

import React from 'react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from '@nextui-org/react'
import {Input} from '@nextui-org/input'
import {EyeFilledIcon} from './EyeFilledIcon'
import {EyeSlashFilledIcon} from './EyeSlashFilledIcon'
import {Select, SelectItem} from '@nextui-org/select'
import {Button} from '@nextui-org/button' // Import Spinner component
import {Spinner} from '@nextui-org/spinner'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css' // Import the toast CSS
import {useRouter} from 'next/navigation'

export const Signup = () => {
	const router = useRouter()
	const [isVisible, setIsVisible] = React.useState(false)
	const [email, setEmail] = React.useState('')
	const [username, setUsername] = React.useState('')
	const [role, setRole] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [error, setError] = React.useState('')
	const [loading, setLoading] = React.useState(false) // Loading state

	const roles = [
		{key: 'seller', label: 'Seller'},
		{key: 'bidder', label: 'Bidder'}
	]

	const toggleVisibility = () => setIsVisible(!isVisible)

	const handleSignup = async () => {
		setError('')
		setLoading(true) // Set loading to true when starting the signup

		// Validation: Check if all fields are filled
		if (!email || !username || !role || !password) {
			setError('All fields are required.')
			toast.error('All fields are required.')
			setLoading(false) // Reset loading state
			return
		}

		const signupData = {email, name: username, role, password}

		try {
			const response = await fetch('http://localhost:8000/users/signup/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(signupData)
			})

			if (!response.ok) {
				const errorData = await response.json()
				if (errorData.email[0]) {
					toast.error('Email already exists')
				} else {
					toast.error('Error during signup')
				}
				setLoading(false) // Reset loading state
				return
			}

			const data = await response.json()
			console.log('Signup successful:', data)
			toast.success('Signup successful!')
			// Reset the form fields here
			setEmail('')
			setUsername('')
			setRole('') // Reset the role state
			setPassword('')
			router.push('/login')
		} catch (error) {
			console.error('Error during signup:', error)
		} finally {
			setLoading(false) // Reset loading state in the end
		}
	}

	return (
		<Card style={{boxShadow: '0px 4px 12px rgba(255, 255, 255, 0.9)'}} className="px-6 py-6 rounded-xl shadow-md shadow-white">
			<CardHeader className="flex pb-6 flex-col gap-3 items-center justify-center">
				<div className="gap-2 flex items-center justify-center">
					<Image alt="nextui logo" height={40} radius="sm" src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4" width={40} />
					{/* <h2 className='text-xl font-semibold'>E-Auctions</h2> */}
				</div>

				<div className="flex flex-col justify-center items-center">
					<p className="text-md">Signup</p>
					<p className="text-small text-default-500">Signup to create a new account.</p>
				</div>
			</CardHeader>
			<Divider />
			<CardBody className="min-w-[420px] ">
				<div className="flex flex-col gap-4 py-3 ">
					<Input type="email" label="Email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<Input type="text" label="Username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
					<Select
						label="Role"
						placeholder="Select a role"
						onChange={(e) => setRole(e.target.value)} // Make sure to set the value correctly
						value={role} // Keep the selected role value
					>
						{roles.map((role) => (
							<SelectItem key={role.key} value={role.key}>
								{role.label}
							</SelectItem>
						))}
					</Select>
					<Input
						label="Password"
						placeholder="Enter your password"
						endContent={
							<button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
								{isVisible ? <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" /> : <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />}
							</button>
						}
						type={isVisible ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Button color="secondary" onClick={handleSignup} disabled={loading}>
						{loading ? <Spinner size="sm" color="white" /> : 'Signup'} {/* Show spinner when loading */}
					</Button>
				</div>
			</CardBody>
			<Divider />
			<CardFooter className="flex pt-6 items-center justify-center text-md">
				<p className="text-small text-default-500">Already have an account?</p>
				<Link showAnchorIcon href="/login" className="ml-1 text-small text-secondary">
					Login
				</Link>
			</CardFooter>
			<ToastContainer /> {/* Toast container for displaying notifications */}
		</Card>
	)
}
