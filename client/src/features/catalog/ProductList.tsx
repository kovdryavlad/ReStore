import { Grid2 } from "@mui/material";
import { Product } from "../../app/models/product";
import ProductCard from "./ProductCard";
import { useAppSelector } from "../../app/store/configureStore";
import ProductCardSkeleton from "./ProductCardSceleton";

interface Props
{
    products: Product[];
}

export default function ProductList({products}: Props){
    const {productsLoaded} = useAppSelector(state => state.catalog)

    return(
        <Grid2 container spacing={4}>
            {products.map(product => 
                <Grid2 size={{xs: 12, md: 4}} key={product.id}>
                    {
                        !productsLoaded 
                        ? (<ProductCardSkeleton/>)
                        : (<ProductCard product={product} />)
                    }                    
                </Grid2>
            )}
        </Grid2>
    );
}