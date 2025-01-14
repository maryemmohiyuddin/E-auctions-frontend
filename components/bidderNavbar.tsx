'use client'
import {Navbar as NextUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem, NavbarMenuItem} from '@nextui-org/navbar'
import {Badge} from '@nextui-org/react'
import {NotificationIcon} from './NotificationIcon'
import {Button} from '@nextui-org/button'
import {Kbd} from '@nextui-org/kbd'
import {Link} from '@nextui-org/link'
import {Input} from '@nextui-org/input'
import {link as linkStyles} from '@nextui-org/theme'
import NextLink from 'next/link'
import clsx from 'clsx'
import {DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from '@nextui-org/react'
import Cookies from 'js-cookie' // Import js-cookie to handle cookies
import {useRouter} from 'next/navigation' // Import useRouter to handle redirection
import React, {useState, useEffect} from 'react'
import {siteConfig} from '@/config/bidderSite'
import {ThemeSwitch} from '@/components/theme-switch'
import {usePathname} from 'next/navigation' // Import usePathname
// import { Avatar } from "./Avatar";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	
	useDisclosure,
  } from "@nextui-org/react";

import {TwitterIcon, GithubIcon, DiscordIcon, HeartFilledIcon, SearchIcon, Logo} from '@/components/icons'

export const Navbar = () => {
	const router = useRouter() // Initialize the useRouter hook
	const [notifications, setNotifications] = useState<any>([])
	const [activeItem, setActiveItem] = useState<string>('') // State for active item
const [name, setName] = useState(null);
	const {isOpen, onOpen, onOpenChange} = useDisclosure();

	useEffect(() => {
	const name =Cookies.get('name')  ? Cookies.get('name') : ""// Replace 'userEmail' with the actual key used for the email in your cookies

	  // Simulating fetching or deriving the name on the client
	  setName(name);
	}, []);
	// Read the email from the cookies
	const userEmail = Cookies.get('email') // Replace 'userEmail' with the actual key used for the email in your cookies

	const fetchNotifications = async () => {
		try {
			const accesstoken = Cookies.get('access_token')
			const user_id = Cookies.get('id')
			const response = await fetch('http://localhost:8000/notifications/notifications/', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accesstoken}`,
					'Content-Type': 'application/json'
				}
			})
			console.log('response.data', response)
			const data = await response.json()
			console.log('data of notifications', data)
			setNotifications(data.notifications || []) // Assuming the API returns a key `notifications`
		} catch (err: any) {
		} finally {
		}
	}

	useEffect(() => {
		fetchNotifications()
	}, [])

	// Logout function
	const onLogout = () => {
		// Delete all cookies
		Object.keys(Cookies.get()).forEach((cookieName) => {
			Cookies.remove(cookieName)
		})

		// Redirect to /login page
		window.location.href = '/login'
	}

	const searchInput = (
		<Input
			aria-label="Search"
			classNames={{
				inputWrapper: 'bg-default-100',
				input: 'text-sm'
			}}
			endContent={
				<Kbd className="hidden lg:inline-block" keys={['command']}>
					K
				</Kbd>
			}
			labelPlacement="outside"
			placeholder="Search..."
			startContent={<SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />}
			type="search"
		/>
	)
	const pathname = usePathname() // Get current route
const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' })
	const [errors, setErrors] = useState({ name: '', password: '', confirmPassword: '' })
	useEffect(() => {
		const savedName = Cookies.get('name') || ''
		setName(savedName)
		setFormData((prev) => ({ ...prev, name: savedName }))
	  }, [])
	  const validateForm = () => {
		const newErrors: typeof errors = { name: '', password: '', confirmPassword: '' }
	
		if (!formData.name.trim()) newErrors.name = 'Name is required.'
		if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.'
		if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.'
	
		setErrors(newErrors)
		return Object.values(newErrors).every((error) => !error)
	  }
	  const handleUpdateProfile = async () => {
		if (!validateForm()) return
	
		const accessToken = Cookies.get('access_token')
		const email = Cookies.get('email')

		const apiBody: any = { name: formData.name }
		if (formData.password) apiBody.password = formData.password
		if (email) apiBody.email = email

	
		try {
		  const response = await fetch('http://localhost:8000/users/update-profile/', {
			method: 'PUT',
			headers: {
			  Authorization: `Bearer ${accessToken}`,
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify(apiBody),
		  })
	
		  if (!response.ok) {
			console.error('Failed to update profile.')
			const savedName = Cookies.get('name') || ''
			setFormData((prev) => ({ ...prev, name: savedName }))
			return
		  }
	
		  const data = await response.json()
		  console.log('Profile updated:', data)
		  Cookies.set('name', formData.name)
		  setName(formData.name)
		  onOpenChange()
		} catch (err) {
		  console.error('Error updating profile:', err)
		  const savedName = Cookies.get('name') || ''
		setFormData((prev) => ({ ...prev, name: savedName }))
		}
		finally{
			onOpenChange()
		setFormData((prev) => ({ ...prev, password: '' }))
		setFormData((prev) => ({ ...prev, confirmPassword: '' }))




		}
	  }
	
	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		setErrors((prev) => ({ ...prev, [field]: '' })) // Clear errors on input change
	  }

	return (
		<>
		<NextUINavbar isBordered className="shadow-sm" maxWidth="xl" position="sticky">
			<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand as="li" className="gap-3 max-w-fit">
					<NextLink className="flex justify-start items-center gap-1 " href="/">
						<Logo />
					</NextLink>
				</NavbarBrand>
				{/* <ul className="hidden lg:flex gap-4 justify-start ml-5"> */}
				<ul className="flex gap-4 justify-start ml-5">
					{siteConfig.navItems.map((item) => {
						const isActive = pathname === item.href // Check if current route matches the item's href

						return (
							<NavbarItem
								key={item.href}
								className={clsx(
									'hover:bg-secondary transition-all duration-300 hover:text-secondary hover:bg-opacity-15 rounded-md px-3 py-1',
									isActive && 'bg-secondary text-secondary bg-opacity-15' // Apply active class
								)}
								onClick={() => setActiveItem(item.href)} // Set active item on click
							>
								<NextLink href={item.href}>{item.label}</NextLink>
							</NavbarItem>
						)
					})}
				</ul>
			</NavbarContent>

			<NavbarMenu>
				{searchInput}
				<div className="mx-4 mt-2 flex flex-col gap-2">
					{siteConfig.navMenuItems.map((item, index) => (
						<NavbarMenuItem key={`${item}-${index}`}>
							<Link color={index === 2 ? 'primary' : index === siteConfig.navMenuItems.length - 1 ? 'danger' : 'foreground'} href="#" size="lg">
								{item.label}
							</Link>
						</NavbarMenuItem>
					))}
				</div>
			</NavbarMenu>
			<NavbarContent as="div" className="items-center" justify="end">
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<div className="flex justify-center items-center">
						{notifications.length > 0 &&(
													<Badge content={notifications.length} size="sm" shape="circle" color="danger">
														<NotificationIcon size={24} className="opacity-65 cursor-pointer" />
													</Badge>
													)}
													{notifications.length==0&&(
														<NotificationIcon size={24} className="opacity-65 cursor-pointer" />
						
													)}
						</div>
					</DropdownTrigger>

					<DropdownMenu aria-label="Notification Actions" variant="flat" className="max-w-[400px] max-h-[400px] overflow-auto">
						<DropdownItem key="no-notifications" className="flex gap-2">
							<div className="flex items-center gap-2">
								<p className="font-semibold text-lg">Notifications</p>
								<NotificationIcon size={24} className="opacity-65 cursor-pointer" />
							</div>
						</DropdownItem>

						{notifications.length > 0 ? (
							notifications.map((notification, index) => (
								<DropdownItem className="gap-2">
									<hr />

									<p className="mt-4">{notification.notification}</p>
								</DropdownItem>
							))
						) : (
							<DropdownItem key="no-notifications" className=" gap-2">
								<p className="font-semibold">No Notifications</p>
							</DropdownItem>
						)}
					</DropdownMenu>
				</Dropdown>
				{/* <ThemeSwitch /> */}

				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Avatar isBordered as="button" className="transition-transform" color="secondary" name={name?.charAt(0).toUpperCase() || "?"} size="sm"  />
					</DropdownTrigger>
					<DropdownMenu aria-label="Profile Actions" variant="flat">
						<DropdownItem key="profile" className="h-14 gap-2">
							<p className="font-semibold">Signed in as</p>
							<p className="font-semibold">{userEmail || 'No email found'}</p> {/* Display email or fallback */}
						</DropdownItem>
						<DropdownItem key="logout" color="secondary" onClick={onOpen}>
																			Update Profile
																		</DropdownItem>
						<DropdownItem key="logout" color="danger" onClick={onLogout}>
							Log Out
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<div>{name || ""}</div>

			</NavbarContent>
		</NextUINavbar>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
				  {(onClose) => (
					<>
					  <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
					  <ModalBody>
					  <Input
					label="Name"
					placeholder="Enter your name"
					value={formData.name}
					onChange={(e) => handleInputChange('name', e.target.value)}
					isInvalid={!!errors.name}
					errorMessage={errors.name}
				  />
				  <Input
					label="Password"
					placeholder="Enter new password"
					type="password"
					value={formData.password}
					onChange={(e) => handleInputChange('password', e.target.value)}
					isInvalid={!!errors.password}
					errorMessage={errors.password}        
				  />
				  <Input
					label="Confirm Password"
					placeholder="Confirm new password"
					type="password"
					value={formData.confirmPassword}
					onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
					isInvalid={!!errors.confirmPassword}
					errorMessage={errors.confirmPassword}
				  />
					  </ModalBody>
					  <ModalFooter>
						<Button color="danger" variant="light" onPress={onClose}>
						  Close
						</Button>
						<Button color="secondary" onPress={handleUpdateProfile}>
						  Update Profile
						</Button>
					  </ModalFooter>
					</>
				  )}
				</ModalContent>
			  </Modal>
			  </>
	)
}
