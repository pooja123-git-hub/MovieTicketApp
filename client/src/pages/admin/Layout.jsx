import React from 'react'
import AdminLayout from '../../components/admin/AdminNavbar'
import AdminSideBar from '../../components/admin/AdminSideBar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
 <>
 <AdminLayout/>
 <div className='flex'>
    <AdminSideBar/>
    <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
        {/* //moutnt all children route */}
        <Outlet/>
    </div>
 </div>
 </>
  )
}

export default Layout