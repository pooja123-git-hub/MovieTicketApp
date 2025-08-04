import React, { useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminNavbar'
import AdminSideBar from '../../components/admin/AdminSideBar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'
import AdminNavbar from '../../components/admin/AdminNavbar'

const Layout = () => {
    const {isAdmin,fetchIsAdmin}=useAppContext();
    useEffect(()=>{
      fetchIsAdmin()
    },[])
  return isAdmin ?(
 <>
 <AdminNavbar/>
 <div className='flex'>
    <AdminSideBar/>
    <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
        {/* //mount all children route */}
        <Outlet/>
    </div>
 </div>
 </>
  ):<Loading/>
}

export default Layout