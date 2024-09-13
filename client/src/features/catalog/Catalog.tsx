import { Button } from "@mui/material";
import { Product } from "../../app/models/product";
import ProductList from "./ProductList";
import { useState, useEffect } from "react";

export default function Catalog(){
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
       fetch('http://localhost:50011/api/products')
       .then(response => response.json())
       .then(data => setProducts(data))
    }, [])

    return(
        <>
            <ProductList products={products} ></ProductList>
            <Button variant="contained">Add product</Button>
        </>
    );
}