'use client';
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS
import { toast, ToastContainer } from "react-toastify"; // Import toast for notifications
import Cookies from "js-cookie";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation"; // Import useRouter hook
import { Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, useDisclosure } from "@nextui-org/react";


export default function ProductInfo({ id }: any) {
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure();

  const [productDetail, setProductDetail] = useState<any>();
  const [categories, setCategories] = useState<any>([]);
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [subline, setSubline] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [material, setMaterial] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<any>();
  const [category, setCategory] = useState<any>(null);
  const [errors, setErrors] = useState<any>({}); // for form validation errors

  const router = useRouter();

  const handleFetchProductDetail = async () => {
    if (!id) {
      alert("Please select a product for detail.");
      return;
    }
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${id}/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });
      const result = await response.json();
      console.log("result", result)
      setProductDetail(result);
      setProductId(result.id);
      setProductName(result.name);
      setSubline(result.subName);
      setYearOfManufacture(result.yearOfManufacture);
      setMaterial(result.Material);
      setDescription(result.description);
      setWidth(result.width);
      setHeight(result.height);
      setWeight(result.weight);
      setCategory(result.category);
      // Add additional handling for categories if necessary
    } catch (error) {
      console.error("An error occurred while fetching the product:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch("http://localhost:8000/categories/view/", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("An error occurred while fetching categories:", error);
    }
  };

  useEffect(() => {
    handleFetchProductDetail();
    fetchCategories();
    
  }, []);

  const handleBackClick = () => {
    router.push("/products");
  };

  const handleDeleteProduct = async () => {
    if (!id) {
      toast.error("Product ID is missing.");
      return;
    }

    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${id}/delete/`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });

      if (response.ok) {
        toast.success("Product deleted successfully!");
        router.push("/products");
      } else {
        toast.error("Failed to delete the product.");
      }
    } catch (error) {
      console.error("An error occurred while deleting the product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      onDeleteModalOpenChange();
      
    }
  };

  const handleEditProduct = async () => {
    const formData = new FormData();
    formData.append('id', productId);
  
    formData.append('name', productName);
    formData.append('subName', subline);
    formData.append('yearOfManufacture', yearOfManufacture);
    formData.append('Material', material);
    formData.append('description', description);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('weight', weight);
    console.log("category selected", category)
    formData.append('category', category); // Ensuring category is converted to a number
    if (image) {
      formData.append('picture', image); // Add the image file
    }
  
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${id}/update/`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
        body: formData, // Send FormData instead of JSON
      });
  
      if (response.ok) {
        toast.success("Product updated successfully!");
        // router.push(`/products/${id}`);
      } else {
        toast.error("Failed to update the product.");
      }
    } catch (error) {
      console.error("An error occurred while updating the product:", error);
      toast.error("An error occurred while updating the product.");
    } finally {
      onEditModalOpenChange();
      handleFetchProductDetail()
    }
  };
  
  return (
    <>
      <div onClick={handleBackClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
        <IoArrowBackCircleOutline size={'30px'} color={'#8f8d8d'} className='mb-5'/>
      </div>

      {productDetail && (
        <div className="grid grid-cols-2 gap-7 mb-10">
          <div className="flex justify-start items-start col-span-1 ">
            <Image
              alt="NextUI Album Cover"
              className="object-cover border border-gray-300 w-[700px] h-[700px]"
              src={productDetail?.picture}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-2">
            <h1 className="text-sm text-gray-500">{productDetail.subName}</h1>
            <h1 className="text-4xl font-bold">{productDetail.name}</h1>
            <h1 className="text-md mt-5">
  <span className="font-bold text-secondary">Category: </span>
  {categories.find((cat: any) => cat.id === productDetail?.category)?.name || 'Category not found'}
</h1>

            <h1 className="text-md">
              <span className="font-bold text-secondary">Material: </span>
              {productDetail.Material}
            </h1>
            <h1 className="text-md">
              <span className="font-bold text-secondary">Dimensions: </span>
              {productDetail.height} * {productDetail.width} inches
            </h1>
            <h1 className="text-md">
              <span className="font-bold text-secondary">Weight: </span>
              {productDetail.weight} kg
            </h1>
            <h1 className="text-md mb-5">
              <span className="font-bold text-secondary">Year of Manufacture: </span>
              {productDetail.yearOfManufacture}
            </h1>

            <h1 className="text-md">{productDetail.description}</h1>

            <div className="flex gap-4 items-end justify-end mb-10 mt-3">
              <Button
                startContent={<MdDeleteOutline />}
                variant="bordered"
                color="danger"
                onClick={onDeleteModalOpen}
              >
                Delete Product
              </Button>
              <Button startContent={<MdOutlineModeEdit />} color="secondary" onClick={onEditModalOpen}>
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <Modal  isOpen={isEditModalOpen} onOpenChange={onEditModalOpenChange}>
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalBody className='max-h-[500px] overflow-auto'>
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

  <Input
    type="text"
    label="Tagline"
    placeholder="Enter product tagline"
    labelPlacement="outside"
    value={subline}
    onChange={(e) => setSubline(e.target.value)}
    isInvalid={!!errors.subline}
    errorMessage={errors.subline}
  />

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

  <Input
    type="file"
    label="Image"
    labelPlacement="outside"
    accept=".jpg,.jpeg,.png"
    onChange={(e: any) => setImage(e.target.files[0])}
    isInvalid={!!errors.image}
    errorMessage={errors.image}
  />

  {categories.length > 0 ? (

    <Select
      label="Category"
      labelPlacement="outside"
      placeholder="Select category for product"
      defaultSelectedKeys={[category?.toString()]} // Use category.id as a string
      onChange={(value) => setCategory(Number(value.target.value))}
      className="mt-2"
    >
        {console.log("categroy", category)}
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
            <Button color="danger" variant="light" onPress={onEditModalOpenChange}>
              Cancel
            </Button>
            <Button color="secondary" onPress={handleEditProduct}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalOpenChange}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this product?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onDeleteModalOpenChange}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteProduct}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer />
    </>
  );
}
