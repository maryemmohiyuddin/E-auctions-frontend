import ProductPage from "@/components/productPage";



const ProductInfoPage = ({ params }: any) => {
  const { productid , auctionid} = params;

  return (
    <div>
      <ProductPage productid={productid} auctionid={auctionid}/>
      
    </div>
  );
};

export default ProductInfoPage;
