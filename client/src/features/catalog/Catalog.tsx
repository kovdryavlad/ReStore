import { Grid2, Paper } from "@mui/material";
import ProductList from "./ProductList";
import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { fetchFiltersAsync, fetchProductsAsync, productSelectors, setPageNumber, setProductParams } from "./catalogSlice";
import ProductSearch from "./ProductSearch";
import RadioButtonGroup from "../../app/components/RadioButtonGroup";
import CheckboxButtons from "../../app/components/CheckboxButtons";
import AppPagination from "../../app/components/AppPagination";

const sortOptions = [
    {value: 'name', label: 'Alphabetical'},
    {value: 'priceDesc', label: 'Price - High to low'},
    {value: 'price', label: 'Price - Low to high'},
]

export default function Catalog(){

    const products = useAppSelector(productSelectors.selectAll);
    const { productsLoaded, filtersLoaded, brands, types, productParams, metaData } = useAppSelector(state => state.catalog);
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        if(!productsLoaded){
            dispatch(fetchProductsAsync());
        }

    }, [productsLoaded, dispatch])

    useEffect(() => {
        if(!filtersLoaded){
            dispatch(fetchFiltersAsync());
        }
    }, [dispatch, filtersLoaded])


    if(!filtersLoaded) return <LoadingComponent message="Loading products..."/>

    return(
        <Grid2 container columnSpacing={4}>
            <Grid2 size={{xs: 3}}>
                <Paper sx={{mb: 2}}>
                    <ProductSearch />
                </Paper>
                <Paper sx={{mb: 2, p: 2}}>
                    <RadioButtonGroup 
                        options={sortOptions} 
                        onChange={ (event: any) => 
                            dispatch(setProductParams({ orderBy: event.target.value })) }
                        selectedValue={productParams.orderBy}
                    />
                </Paper>

                <Paper sx={{p: 2, mb: 2}}>
                    <CheckboxButtons 
                        items={brands} 
                        checked={productParams.brands} 
                        onChange={ brands => 
                            dispatch(setProductParams({brands}))}
                    />
                </Paper>

                <Paper sx={{p: 2}}>
                <CheckboxButtons 
                        items={types} 
                        checked={productParams.types} 
                        onChange={ types => 
                            dispatch(setProductParams({types}))}
                    />
                </Paper>
            </Grid2>
            <Grid2 size={{xs: 9}} sx={{mb: 4}}>
                <ProductList products={products} ></ProductList>
            </Grid2>
            <Grid2 size={{xs: 3}}/>
            <Grid2 size={{xs: 9}}>
                {metaData && <AppPagination 
                    metaData={metaData} 
                    onPageChange={ pageNumber => dispatch(setPageNumber({pageNumber}))}
                />}
            </Grid2>
    </Grid2>
    );
}