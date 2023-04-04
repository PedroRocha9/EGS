import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/advertisements';
// mock
import PRODUCTS from '../_mock/products';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function ProductsPage() {

    const navigate = useNavigate();

    //on page load, read user from props

    useEffect(() => {
        if (localStorage.getItem('email') != null) {
            console.log(localStorage.getItem('email') + " is logged in");
        }
        else {
            console.log("no user");
            navigate('/login');
        }
    }, []);

    const [openFilter, setOpenFilter] = useState(false);

    const handleOpenFilter = () => {
        setOpenFilter(true);
    };

    const handleCloseFilter = () => {
        setOpenFilter(false);
    };

        //function that on page load, does a get request to the url
        // http://localhost:5000/v1/ads?location=portugal&publisher_id=1
        // and then, the response is an array of snippets of html code
        // loop through the array and append each snippet to the div with id 'advertisements'

        useEffect(() => {
            fetch('http://localhost:5000/v1/ads?location=portugal&publisher_id=1')
                .then(response => response.json())
                .then(data => {
                    var array = data.ads;
                    for (var i = 0; i < array.length; i++) {
                        var div = document.getElementById('advertisements');
                        div.innerHTML += array[i];
                    }
                });
        }, []);

    return (
        <>
        <Helmet>
            <title> Advertisements </title>
        </Helmet>

        <Container>
            <Typography variant="h4" sx={{ mb: 5 }}>
            My Advertisements
            </Typography>
            <ProductList products={PRODUCTS} />
            <div id='advertisements'></div>
        </Container>
        </>
    );
}
