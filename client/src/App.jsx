import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import {useAppContext}  from './context/AppContext'
import Home from './pages/Home'
import Movies from './pages/Movies';
import MoviesDetails from './pages/MovieDetail';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favorite from './pages/Favorite';
import {Toaster} from 'react-hot-toast';
import Footer from './components/Footer'
import HeroSection from './components/HeroSection';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddShows from './pages/admin/AddShows';
import ListShows from './pages/admin/ListShows';
import ListBookings from './pages/admin/ListBookings';
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading'
const App = () => {
  const isAdminRoute= useLocation().pathname.startsWith('/admin');
  const { user }=useAppContext()
  return (
  <>
  
  <Toaster/>
  {!isAdminRoute && <Navbar/>}
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/movies" element={<Movies/>}/>
    <Route path="/movies/:id" element={<MoviesDetails/>}/>
    <Route path="/movies/:id/:date" element={<SeatLayout/>}/>
    <Route path="/my-bookings" element={<MyBookings/>}/>
    <Route path="/loading/:nextUrl" element={<Loading/>}/>

    <Route path="/favorite" element={<Favorite/>}/>
    <Route path="/admin/*" element={user ? <Layout/>:(
      <div className='min-h-screen flex justify-center items-center'>
        <SignIn fallbackRedirectUrl={'/admin'}/>
      </div>
    )}>
    <Route  index element={<Dashboard/>}/>
       <Route   path='add-shows'index element={<AddShows/>}/>
        <Route   path='list-shows'index element={<ListShows/>}/>
         <Route   path='list-bookings'index element={<ListBookings/>}/>
          </Route>
    </Routes>
{!isAdminRoute && <Footer />}

  </>
  )
}

export default App
