import { Box, Button, Drawer, Grid2, Paper } from "@mui/material";
import ProductList from "./ProductList";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { setPageNumber, setProductParams } from "./catalogSlice";
import ProductSearch from "./ProductSearch";
import RadioButtonGroup from "../../app/components/RadioButtonGroup";
import CheckboxButtons from "../../app/components/CheckboxButtons";
import AppPagination from "../../app/components/AppPagination";
import useProducts from "../../app/hooks/useProducts";
import { useState } from "react";

const sortOptions = [
    { value: 'name', label: 'Alphabetical' },
    { value: 'priceDesc', label: 'Price - High to low' },
    { value: 'price', label: 'Price - Low to high' },
]

export default function Catalog() {
    const { products, brands, types, filtersLoaded, metaData } = useProducts();
    const { productParams } = useAppSelector(state => state.catalog);
    const dispatch = useAppDispatch();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = (isDrawerOpen: boolean) => () => {
      setIsDrawerOpen(isDrawerOpen);
    };

    const catalogFilters = (
        <>
            <Paper sx={{ mb: 2 }}>
                <ProductSearch />
            </Paper>
            <Paper sx={{ mb: 2, p: 2 }}>
                <RadioButtonGroup
                    options={sortOptions}
                    onChange={(event: any) =>
                        dispatch(setProductParams({ orderBy: event.target.value }))}
                    selectedValue={productParams.orderBy}
                />
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <CheckboxButtons
                    items={brands}
                    checked={productParams.brands}
                    onChange={brands =>
                        dispatch(setProductParams({ brands }))}
                />
            </Paper>

            <Paper sx={{ p: 2 }}>
                <CheckboxButtons
                    items={types}
                    checked={productParams.types}
                    onChange={types =>
                        dispatch(setProductParams({ types }))}
                />
            </Paper>
        </>
    );

    if (!filtersLoaded) return <LoadingComponent message="Loading products..." />

    return (
        <>
            <Drawer open={isDrawerOpen} onClose={toggleDrawer(false)}>
                <Box paddingTop={2}/>
                {catalogFilters}
            </Drawer>

            <Grid2 container columnSpacing={4}>
                <Grid2 sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Button onClick={() => setIsDrawerOpen(true)}>Open Filters</Button>
                </Grid2>
                <Grid2 size={{ xs: 3 }}
                    sx={{
                        display: { xs: 'none', sm: 'block' }
                    }}
                >
                    {catalogFilters}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 9 }} sx={{ mb: 4 }}>
                    <ProductList products={products} ></ProductList>
                </Grid2>
                <Grid2 size={{ xs: 3 }} />
                <Grid2 size={{ xs: 9 }}>
                    {metaData && <AppPagination
                        metaData={metaData}
                        onPageChange={pageNumber => dispatch(setPageNumber({ pageNumber }))}
                    />}
                </Grid2>
            </Grid2>
        </>
    );
}