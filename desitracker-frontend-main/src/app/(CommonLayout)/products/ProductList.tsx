// src/components/ProductList.tsx
import { useGetProductsByUserAndBusinessQuery } from '@/app/redux/services/products.services';
import React from 'react';

interface ProductListProps {
  userId: string;
  businessId: string;
}

const ProductList: React.FC<ProductListProps> = ({ userId, businessId }) => {
  const { data: products, error, isLoading } = useGetProductsByUserAndBusinessQuery({
    user_id: userId,
    business_id: businessId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h2>Product List</h2>
      <ul>
        {products?.map((product) => (
          <li key={product._id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
