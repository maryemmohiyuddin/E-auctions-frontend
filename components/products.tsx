'use client'
import {useState, useEffect} from 'react'
import {Card, CardBody, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure} from '@nextui-org/react'
import Cookies from 'js-cookie' // Import js-cookie to handle cookies
// import { MdDeleteOutline } from "react-icons/md";
import {IoMdAdd} from 'react-icons/io'
import {BiCategory} from 'react-icons/bi'
import {title} from '@/components/primitives'
import {Select, SelectItem} from '@nextui-org/react'
import 'react-toastify/dist/ReactToastify.css' // Import toast CSS
import {toast, ToastContainer} from 'react-toastify' // Import toast for notifications
import {Tabs, Tab} from '@nextui-org/react'
import {useRouter} from 'next/navigation' // Import useRouter

export default function Products() {
	const {isOpen, onOpen, onOpenChange} = useDisclosure()
	const {isOpen: isManageCategoriesOpen, onOpen: onManageCategoriesOpen, onOpenChange: onManageCategoriesOpenChange} = useDisclosure()
	const [productName, setProductName] = useState('')
	const [subline, setSubline] = useState('')
	const [yearOfManufacture, setYearOfManufacture] = useState('')
	const [material, setMaterial] = useState('')
	const [description, setDescription] = useState('')
	const [width, setWidth] = useState('')
	const [height, setHeight] = useState('')
	const [weight, setWeight] = useState('')
	const variants = ['solid', 'underlined', 'bordered', 'light']
	const [image, setImage] = useState<any>(null)
	const [errors, setErrors] = useState<any>({})
	const [list, setList] = useState<any>([])
	const [products, setProducts] = useState<any>([])

	const [categories, setCategories] = useState<any>([])
	const [newCategoryName, setNewCategoryName] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<any>()
	const [selectedCat, setSelectedCat] = useState()

	const [productSelectedCategory, setProductSelectedCategory] = useState()

	// const [productToDelete, setProductToDelete] = useState(null);
	const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange} = useDisclosure()

	useEffect(() => {
		fetchProducts()
		fetchCategories() // Fetch categories when the component loads
	}, [])

	const validateInputs = () => {
		let newErrors = {} as any
		if (!productName.trim()) newErrors.productName = 'Product name is required.'
		if (!subline.trim()) newErrors.subline = 'Tagline is required.'
		if (!yearOfManufacture.trim()) newErrors.yearOfManufacture = 'Year of Manufacture is required.'
		if (!material.trim()) newErrors.material = 'Material is required.'
		if (!width.trim()) newErrors.width = 'Product width is required.'
		if (!height.trim()) newErrors.height = 'Product height is required.'
		if (!weight.trim()) newErrors.weight = 'Product weight is required.'
		if (!description.trim()) newErrors.description = 'Product description is required.'

		if (!image) newErrors.image = 'Image is required.'
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}
	const handleSubmit = async () => {
		if (validateInputs()) {
			try {
				const accesstoken = Cookies.get('access_token')
				const id = Cookies.get('id')

				const formData = new FormData() as any
				formData.append('name', productName)
				formData.append('subName', subline)
				formData.append('description', description)
				formData.append('width', width)
				formData.append('height', height)
				formData.append('weight', weight)
				formData.append('yearOfManufacture', yearOfManufacture)
				formData.append('Material', material)
				formData.append('picture', image)
				formData.append('user', id)
				formData.append('category', productSelectedCategory)

				const response = await fetch('http://localhost:8000/products/create/', {
					method: 'POST',
					body: formData,
					headers: {
						Authorization: `Bearer ${accesstoken}`
					}
				})

				if (response.ok) {
					console.log('Product added successfully')
					toast.success('Product added successfully!')

					onOpenChange()
					setProductName('')
					setImage(null)
					setSubline('')
					setYearOfManufacture('')
					setMaterial('')
					setDescription('')
					setWidth('')
					setHeight('')
					setWeight('')
					setErrors({})
					fetchProducts()
				} else {
					console.error('Failed to add product')
				}
			} catch (error) {
				console.error('An error occurred while adding the product:', error)
			}
		}
	}

	const fetchProducts = async () => {
		try {
			const accesstoken = Cookies.get('access_token')
			const response = await fetch('http://localhost:8000/products/view/', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accesstoken}`
				}
			})
			const data = await response.json()
			setList(data)
		} catch (error) {
			console.error('An error occurred while fetching products:', error)
		}
	}

	const fetchCategories = async () => {
		try {
			const accesstoken = Cookies.get('access_token')
			const response = await fetch('http://localhost:8000/categories/view/', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accesstoken}`
				}
			})
			const data = await response.json()
			setCategories(data)
			setSelectedCat(data[0].id)
		} catch (error) {
			console.error('An error occurred while fetching categories:', error)
		}
	}
	const handleCategoryChange = (value: any) => {
		console.log('value', value.target.value)
		setSelectedCategory(value.target.value)
	}
	const handleProductCategoryChange = (value: any) => {
		console.log('value', value.target.value)
		setProductSelectedCategory(value.target.value)
	}

	const filterProducts = () => {
		console.log('in filter products', list, selectedCat)
		const categoryNumber = Number(selectedCat)

		const filteredProducts = list.filter((li: any) => li.category === categoryNumber)
		console.log('Filtered Products:', filteredProducts)
		setProducts(filteredProducts)
		return filteredProducts // Return or use the filtered products as needed
	}

	const handleAddCategory = async () => {
		if (newCategoryName.trim() === '') {
			alert('Category name is required.')
			return
		}
		try {
			const accesstoken = Cookies.get('access_token')
			const response = await fetch('http://localhost:8000/categories/add/', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accesstoken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({name: newCategoryName})
			})

			if (response.ok) {
				console.log('Category added successfully')
				setNewCategoryName('')
				fetchCategories()
				onManageCategoriesOpenChange()
			} else {
				console.error('Failed to add category')
			}
		} catch (error) {
			console.error('An error occurred while adding the category:', error)
		}
	}

	const handleDeleteCategories = async () => {
		if (selectedCategory == null) {
			alert('Please select a category to delete.')
			return
		}
		try {
			const accesstoken = Cookies.get('access_token')
			const response = await fetch(`http://localhost:8000/categories/${selectedCategory}/delete/`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accesstoken}`
				}
			})

			if (response.ok) {
				console.log('Selected category deleted successfully')
				toast.success('Category deleted successfully!')
				fetchCategories() // Refresh the categories after deletion
				setSelectedCategory(null) // Clear the selected category
			} else {
				console.error('Failed to delete the category')
			}
		} catch (error) {
			console.error('An error occurred while deleting the category:', error)
		}
	}
	useEffect(() => {
		filterProducts()
	}, [list, selectedCat])
	const router = useRouter() // Initialize useRouter hook

	const handleProductClick = (id: string) => {
		// Navigate to /productinfo/[id]
		router.push(`/productinfo/${id}`)
	}
	return (
		<div className="mb-10">
			{/* Modal for Adding Products */}
			<Modal
				isOpen={isOpen}
				placement={'auto'}
				onOpenChange={onOpenChange}
				classNames={{
					base: 'fixed'
				}}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Add New Product</ModalHeader>
							<ModalBody className="max-h-[500px] overflow-auto">
								<Input
									type="text"
									label="Name"
									placeholder="Enter product name"
									labelPlacement="outside"
									value={productName}
									onChange={(e) => setProductName(e.target.value)}
									isInvalid={!!errors.productName}
									errorMessage={errors.productName}
								/>

								<Input type="text" label="Tagline" placeholder="Enter product tagline" labelPlacement="outside" value={subline} onChange={(e) => setSubline(e.target.value)} isInvalid={!!errors.subline} errorMessage={errors.subline} />

								<Input
									type="text"
									label="Year of Manufacture"
									placeholder="Enter year of manufacture"
									labelPlacement="outside"
									value={yearOfManufacture}
									onChange={(e) => setYearOfManufacture(e.target.value)}
									isInvalid={!!errors.yearOfManufacture}
									errorMessage={errors.yearOfManufacture}
								/>

								<Input
									type="text"
									label="Material"
									placeholder="Enter product material"
									labelPlacement="outside"
									value={material}
									onChange={(e) => setMaterial(e.target.value)}
									isInvalid={!!errors.material}
									errorMessage={errors.material}
								/>

								{/* Using a textarea-style input for the description */}
								<Textarea
									label="Description"
									placeholder="Enter product description"
									labelPlacement="outside"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									isInvalid={!!errors.description}
									errorMessage={errors.description}
								/>

								<Input
									type="number"
									label="Width (in inches)"
									placeholder="Enter product width"
									labelPlacement="outside"
									value={width}
									onChange={(e) => setWidth(e.target.value)}
									isInvalid={!!errors.width}
									errorMessage={errors.width}
								/>

								<Input
									type="number"
									label="Height (in inches)"
									placeholder="Enter product height"
									labelPlacement="outside"
									value={height}
									onChange={(e) => setHeight(e.target.value)}
									isInvalid={!!errors.height}
									errorMessage={errors.height}
								/>

								<Input
									type="number"
									label="Weight (in kg)"
									placeholder="Enter product weight"
									labelPlacement="outside"
									value={weight}
									onChange={(e) => setWeight(e.target.value)}
									isInvalid={!!errors.weight}
									errorMessage={errors.weight}
								/>

								<Input type="file" label="Image" labelPlacement="outside" accept=".jpg,.jpeg,.png" onChange={(e: any) => setImage(e.target.files[0])} isInvalid={!!errors.image} errorMessage={errors.image} />

								{categories.length > 0 ? (
									<Select label="Category" labelPlacement="outside" placeholder="Select category for product" onChange={(value) => handleProductCategoryChange(value)} className="mt-2">
										{categories.map((cat: any) => (
											<SelectItem key={cat.id} value={cat.id}>
												{cat.name}
											</SelectItem>
										))}
									</Select>
								) : (
									<p className="text-lightgray text-xs">Please add a category first.</p>
								)}
							</ModalBody>

							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Close
								</Button>
								<Button color="secondary" disabled={categories.length === 0} onPress={handleSubmit}>
									Submit
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			{/* Modal for Managing Categories */}
			<Modal
				isOpen={isManageCategoriesOpen}
				onOpenChange={onManageCategoriesOpenChange}
				classNames={{
					closeButton: 'absolute right-1'
				}}>
				<ModalContent>
					<ModalHeader>Manage Categories</ModalHeader>
					<ModalBody>
						<h2 color="secondary">Add Category</h2>
						<Input type="text" placeholder="Enter category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="mt-2" />
						<Button color="secondary" onPress={handleAddCategory} className="mt-2">
							Add
						</Button>

						<hr className="my-4" />
						<h2 color="secondary">Delete Category</h2>

						{categories.length > 0 && (
							<Select placeholder="Select categories to delete" onChange={(value) => handleCategoryChange(value)} className="mt-2">
								{categories.map((cat: any) => (
									<SelectItem key={cat.id}>{cat.name}</SelectItem>
								))}
							</Select>
						)}
						{categories.length === 0 && <p className="text-lightgray  text-xs">No categories available to delete.</p>}
						{categories.length !== 0 && <p className="text-danger  text-xs">* Deleting a category will also delete all its products.</p>}
						<Button color="danger" onPress={handleDeleteCategories} disabled={categories.length === 0} className="mt-2">
							Delete
						</Button>
					</ModalBody>
					<ModalFooter>
						<Button color="danger" variant="light" onPress={() => onManageCategoriesOpenChange()}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			
			<div className="mb-5  justify-between items-center  px-8 py-4 bg-secondary rounded-xl">
				<div className="text-white">
					<h1 className="text-2xl  font-semibold">Your Products</h1>
					<p>
						Welcome to Your Products Page! Here, you can easily manage your products by adding new items, editing existing ones, or removing those you no longer need. Whether you're updating details, adjusting prices, or showcasing new
						inventory, this page provides all the tools you need to keep your product listings up to date and organized. Enjoy a seamless experience as you manage your products with ease!
					</p>
				</div>
				<div className="flex  gap-3 my-5">
					<Button onPress={onManageCategoriesOpen} className="bg-white  text-secondary" startContent={<BiCategory />}>
						Manage Categories
					</Button>
					<Button onPress={onOpen} className="bg-white  text-secondary" startContent={<IoMdAdd />}>
						Add Product
					</Button>
				</div>
			</div>
			<div className="flex gap-10 flex-col sm:flex-row py-4 sm:py-0">
				<div>
					<p className="mb-3">Categories</p>
					{/* <div className="flex flex-wrap"> */}
					<div className="w-full">
						<Tabs
							color="secondary"
							aria
							onSelectionChange={(value: any) => setSelectedCat(value)}
							
							classNames={{
								base: 'w-full',
								tabList: 'flex flex-row flex-wrap sm:flex-col px-5 py-5 bg-[#e8e8e8] bg-opacity-50 sm:w-[250px] sm:px-3',
								tab: 'bg-opacity-15 flex-1',
								cursor: 'w-full bg-opacity-15 bg-secondary',

								tabContent: 'group-data-[selected=true]:text-secondary'
							}}
							variant={'solid'}
							aria-label="Tabs variants"
							isVertical>
							{categories.map((item: any, index: any) => (
								<Tab key={item.id} title={item.name} />
							))}
						</Tabs>
					</div>
				</div>
				<div className="w-full">
					<p className="mb-3">Products</p>
					{/* <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-col-4 w-full"> */}
					<div className="gap-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
						{products.map((item: any, index: any) => (
							<Card
								shadow="sm"
								key={index}
								isPressable
								onPress={() => handleProductClick(item.id)} // Use the handler to navigate
								className="relative group">
								
								<CardBody className="overflow-visible p-0">
									<Image shadow="sm" radius="lg" width="100%" alt={item.name} className="w-full object-cover h-[140px]" src={item.picture} />
									<div className="absolute z-[50] inset-0 bg-black/10 transition-opacity duration-500 opacity-0 group-hover:opacity-100"></div>
								</CardBody>
								<CardFooter className="justify-start text-left text-sm">{item.name}</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</div>
			<ToastContainer /> {/* Toast container for displaying notifications */}
		</div>
	)
}
