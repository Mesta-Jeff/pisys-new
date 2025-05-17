import React, { useCallback, useEffect, useState } from 'react'
import Config from '../../helpers/Config'
import { useOutletContext } from 'react-router-dom';
import { useProductStore } from '../../utils/productStore';
import axios from 'axios';
import CanvasJSReact from '@canvasjs/react-charts';

const titles = "Dashboard";
const { CanvasJSChart } = CanvasJSReact;

const Dashboard = () => {


  // TODO: Getting favorites from the Gobal session
  const { FAVORITES } = useProductStore();

  const { setPageTitle } = useOutletContext();
  const baseUrl = Config[0].BASE_URL;
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [PRODUCT_LIST, setPRODUCT_LIST] = useState([])
  const [CATEGORY_LIST, setCATEGORY_LIST] = useState([]);

  const [priceChartDataPoints, setPriceChartDataPoints] = useState([]);
  const [categoryChartDataPoints, setCategoryChartDataPoints] = useState([]);
  const [ratingChartDataPoints, setRatingChartDataPoints] = useState([]);


  // TODO Set the page title dynamically
  useEffect(() => {
    setPageTitle(titles);
    Config[0].currentPage = titles;
    document.getElementById("pageTitle").innerHTML = Config[0].currentPage + Config[0].APP_TITLE;
  }, [setPageTitle]);


  // TODO:  Fetching Data from the api
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/products`);
      const rawList = response.data;
      const validProducts = rawList.filter(
        (item) => typeof item === 'object' && !Array.isArray(item) && item.price && item.category && item.rating
      );

      const totalExpectedIncome = validProducts.reduce(
        (sum, product) => sum + Number(product.price),
        0
      );

      setExpectedIncome(totalExpectedIncome.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }));
      setPRODUCT_LIST(validProducts);

      // Prepare data for the price chart
      const priceDataPoints = validProducts.map(product => ({
        label: product.name,
        y: product.price,
      }));
      setPriceChartDataPoints(priceDataPoints);

      // Prepare data for the category chart
      const categoryCounts = validProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});
      const categoryDataPoints = Object.keys(categoryCounts).map(category => ({
        label: category,
        y: categoryCounts[category],
      }));
      setCategoryChartDataPoints(categoryDataPoints);

      // Prepare data for the rating chart
      const ratingCounts = validProducts.reduce((acc, product) => {
        const roundedRating = Math.round(product.rating); // Round ratings to whole numbers for better grouping
        acc[roundedRating] = (acc[roundedRating] || 0) + 1;
        return acc;
      }, {});
      const ratingDataPoints = Object.keys(ratingCounts).map(rating => ({
        label: rating === '0' ? 'Unrated' : `${rating} Star${rating > 1 ? 's' : ''}`,
        y: ratingCounts[rating],
      }));
      setRatingChartDataPoints(ratingDataPoints);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [baseUrl, setPRODUCT_LIST, setExpectedIncome, setPriceChartDataPoints, setCategoryChartDataPoints, setRatingChartDataPoints]);



  // TODO: Getting the catgories for the dropdown from the api
  const fetchCategories = useCallback(() => {
    axios.get(`${baseUrl}/categories`)
      .then(res => {
        const options = res.data
        setCATEGORY_LIST(options);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });
  }, [baseUrl, setCATEGORY_LIST]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);


  const priceChartOptions = {
    animationEnabled: true,
    title: {
      text: "Product Prices"
    },
    axisY: {
      prefix: "GHS"
    },
    toolTip: {
      shared: true,
      content: "{name}: GHS{y}"
    },
    legend: {
      fontSize: 13
    },
    data: [{
      type: "column",
      showInLegend: true,
      name: "Price Chart",
      markerSize: 0,
      dataPoints: priceChartDataPoints
    }]
  };

  const categoryChartOptions = {
    animationEnabled: true,
    title: {
      text: "Product Categories"
    },
    data: [{
      type: "pie",
      indexLabel: "{label} ({y})",
      dataPoints: categoryChartDataPoints
    }]
  };

  const ratingChartOptions = {
    animationEnabled: true,
    title: {
      text: "Product Ratings"
    },

    data: [{
      type: "pie",
      startAngle: 75,
      toolTipContent: "<b>{label}</b>: {y}%",
      showInLegend: "true",
      legendText: "{label}",
      indexLabelFontSize: 16,
      indexLabel: "{label} ({y})",
      dataPoints: ratingChartDataPoints
    }]
  };


  return (
    <div className="content">

      {/* Start Content*/}
      <div className="container-fluid">

        {/* start page title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box" >
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="#">{Config[0].BRAND_NAME}</a></li>
                  <li className="breadcrumb-item active">{titles}</li>
                </ol>
              </div>
              <h4 className="page-title">{titles}</h4>
            </div>
          </div>
        </div>
        {/* end page title */}

        <div className="row">
          <div className="col-12">
            <div className="card widget-inline">
              <div className="card-body p-0">
                <div className="row g-0">

                  <div className="col-sm-6 col-lg-3">
                    <div className="card rounded-0 shadow-none m-0 bg-success-lighten">
                      <div className="card-body text-center">
                        <i className=" ri-pie-chart-2-line text-muted font-24" />
                        <h3><span>{PRODUCT_LIST.length}</span></h3>
                        <p className="text-muted font-15 mb-0">Total Products</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card rounded-0 shadow-none m-0 border-start border-primary bg-primary-lighten">
                      <div className="card-body text-center">
                        <i className="ri-list-check-2 text-muted font-24" />
                        <h3><span>{CATEGORY_LIST.length}</span></h3>
                        <p className="text-muted font-15 mb-0">Total Categories</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card rounded-0 shadow-none m-0 border-start border-danger bg-danger-lighten">
                      <div className="card-body text-center">
                        <i className="ri-star-line text-muted font-24" />
                        <h3><span>{FAVORITES.length}</span></h3>
                        <p className="text-muted font-15 mb-0">Your Favorites</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card rounded-0 shadow-none m-0 border-start border-info bg-info-lighten">
                      <div className="card-body text-center">
                        <i className="ri-line-chart-line text-muted font-24" />
                        <h3><span>GHS{expectedIncome}</span> <i className="mdi mdi-arrow-up text-success" /></h3>
                        <p className="text-muted font-15 mb-0">Expected Income</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-lg-5">
            <div className="card">
              <div className="card-body pt-0">
                <div className="mt-3 mb-4" style={{ height: 360 }}>
                  <CanvasJSChart options={ratingChartOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card">
              <div className="card-body pt-2">
                <div className="table-responsive" style={{ height: 404 }}>
                  <CanvasJSChart options={categoryChartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <CanvasJSChart options={priceChartOptions} />
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  )
}

export default Dashboard