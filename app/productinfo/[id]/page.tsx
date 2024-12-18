import ProductInfo from "@/components/productInfo";

interface Props {
  params: { id: string };
}

const ProductInfoPage = ({ params }: Props) => {
  const { id } = params;

  return (
    <div>
      <ProductInfo id={id}/>
      
    </div>
  );
};

export default ProductInfoPage;
