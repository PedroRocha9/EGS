import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
    const theme = useTheme();

    const navigate = useNavigate();

    const [numAds, setNumAds] = useState(0);
    const [numImpressions, setNumImpressions] = useState(0);
    const [numClicks, setNumClicks] = useState(0);
    const [avgCpr, setAvgCpr] = useState(0);
    const [bestClickAd, setBestClickAd] = useState(null);
    const [bestImpressionAd, setBestImpressionAd] = useState(null);
    const [hasData, setHasData] = useState(true);

    //on page load, read user from props

    useEffect(() => {
        if (localStorage.getItem('email') != null) {
            console.log(localStorage.getItem('email') + " is logged in");

            //get user data from backend

            fetch('http://localhost:5000/v1/analytics/advertiser/' + localStorage.getItem('id'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token').replace(/['"]+/g, ''),
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        setNumAds(data.number_of_ads);
                        setNumImpressions(data.total_impressions);
                        setNumClicks(data.total_clicks);
                        setAvgCpr(data.total_ctr);
                        setBestClickAd(data.highest_click_ad);
                        setBestImpressionAd(data.highest_impression_ad);
                    });
                } else {
                    alert("No data found");
                    setHasData(false);
                }
            }
            )
        }
        else {
            console.log("no user");
            navigate('/login');
        }
    }, []);

    return (
        <>
        <Helmet>
            <title> Dashboard</title>
        </Helmet>

        <Container maxWidth="xl">
            <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back!
            </Typography>

            <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <AppWidgetSummary title="Active Image Ads" total={numAds} color="info" icon={'ant-design:picture-filled'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <AppWidgetSummary title="Total Impressions" total={numImpressions} color="warning" icon={'ant-design:eye-filled'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <AppWidgetSummary title="Total Clicks" total={numClicks} color="error" icon={'ant-design:pushpin-filled'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <AppWidgetSummary title="Average CPR" total={avgCpr} icon={'ant-design:rise-outlined'} />
            </Grid>

            {/* <Grid item xs={12} md={6} lg={8}>
                <AppWebsiteVisits
                title="Total Engagement"
                chartLabels={[
                    '05/01/2022',
                    '06/01/2022',
                    '07/01/2022',
                    '08/01/2022',
                    '09/01/2022',
                    '10/01/2022',
                    '11/01/2022',
                    '12/01/2022',
                    '01/01/2023',
                    '02/01/2023',
                    '03/01/2023',
                    '04/01/2023',
                ]}
                chartData={[
                    // {
                    //   name: 'Team A',
                    //   type: 'column',
                    //   fill: 'solid',
                    //   data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 44],
                    // },
                    {
                    name: 'Impressions',
                    type: 'line',
                    fill: 'solid',
                    color: "#9BBFE0",
                    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43, 44],
                    },
                    {
                    name: 'Clicks',
                    type: 'area',
                    fill: 'gradient',
                    color: "#FBE29F",
                    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 12],
                    },
                ]}
                />
            </Grid> */}

            <Grid item xs={12} md={6} lg={4}>
                <AppCurrentVisits
                title="Engagement Distribution"
                chartData={[
                    { label: 'Image Clicks', value: numClicks },
                    { label: 'Image Impressions', value: numImpressions },
                ]}
                chartColors={[

                    "#E8A09A",
                    "#FBE29F",

                ]}
                />
            </Grid>

            {/* <Grid item xs={12} md={6} lg={8}>
                <AppConversionRates
                title="Conversion Rates"
                subheader="(+43%) than last year"
                chartData={[
                    { label: 'Italy', value: 400 },
                    { label: 'Japan', value: 430 },
                    { label: 'China', value: 448 },
                    { label: 'Canada', value: 470 },
                    { label: 'France', value: 540 },
                    { label: 'Germany', value: 580 },
                    { label: 'South Korea', value: 690 },
                    { label: 'Netherlands', value: 1100 },
                    { label: 'United States', value: 1200 },
                    { label: 'United Kingdom', value: 1380 },
                ]}
                />
            </Grid> */}

            {/* <Grid item xs={12} md={6} lg={4}>
                <AppCurrentSubject
                title="Current Subject"
                chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
                chartData={[
                    { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                    { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                    { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
                ]}
                chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
                />
            </Grid> */}

            {/* <Grid item xs={12} md={6} lg={8}>
                <AppNewsUpdate
                title="News Update"
                list={[...Array(5)].map((_, index) => ({
                    id: faker.datatype.uuid(),
                    title: faker.name.jobTitle(),
                    description: faker.name.jobTitle(),
                    image: `/assets/images/covers/cover_${index + 1}.jpg`,
                    postedAt: faker.date.recent(),
                }))}
                />
            </Grid> */}

            {/* <Grid item xs={12} md={6} lg={4}>
                <AppOrderTimeline
                title="Order Timeline"
                list={[...Array(5)].map((_, index) => ({
                    id: faker.datatype.uuid(),
                    title: [
                    '1983, orders, $4220',
                    '12 Invoices have been paid',
                    'Order #37745 from September',
                    'New order placed #XF-2356',
                    'New order placed #XF-2346',
                    ][index],
                    type: `order${index + 1}`,
                    time: faker.date.past(),
                }))}
                />
            </Grid> */}

            {bestImpressionAd != null && <Grid item xs={12} md={6} lg={8}>
                <AppTrafficBySite
                title="Top performing advertisements"
                list={[
                    {
                    name: bestImpressionAd.description,
                    url: bestImpressionAd.ad_creative,
                    value: bestImpressionAd.impressions,
                    id: "Advertisement " + bestImpressionAd.id,
                    description: 'Impressions',
                    active: bestImpressionAd.active
                    },
                    {
                    name: bestClickAd.description,
                    url: bestClickAd.ad_creative,
                    value: bestClickAd.clicks,
                    id: "Advertisement " + bestClickAd.id,
                    description: 'Clicks',
                    active: bestClickAd.active
                    },
                ]}
                />
            </Grid>
            }

            {/* <Grid item xs={12} md={6} lg={8}>
                <AppTasks
                title="Tasks"
                list={[
                    { id: '1', label: 'Create FireStone Logo' },
                    { id: '2', label: 'Add SCSS and JS files if required' },
                    { id: '3', label: 'Stakeholder Meeting' },
                    { id: '4', label: 'Scoping & Estimations' },
                    { id: '5', label: 'Sprint Showcase' },
                ]}
                />
            </Grid> */}
            </Grid>
        </Container>
        </>
    );
}
