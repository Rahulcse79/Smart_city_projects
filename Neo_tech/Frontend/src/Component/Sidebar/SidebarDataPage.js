import React from 'react';
import * as AiIcons from 'react-icons/ai';
import { AiOutlineCamera } from 'react-icons/ai'; 
import * as RiIcons from 'react-icons/ri';
import { IoSettings, IoLogOutOutline } from 'react-icons/io5';
import { AiFillDelete } from 'react-icons/ai';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const SidebarDataPage = () => {

  const navigate = useNavigate();

  const logOutCall = async () => {
    await Cookies.remove("session");
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate("/login");
  };

  const iconColor = { color: '#9cf2ff' };

  const SidebarData = [
    {
      title: 'Dashboard',
      path: '/',
      onClick: '',
      icon: <AiIcons.AiFillHome style={iconColor} />
    },
    {
      title: 'Smart IOT',
      icon: <RiIcons.RiDashboardFill style={iconColor} />,
      iconClosed: <RiIcons.RiArrowDownSFill style={iconColor} />,
      iconOpened: <RiIcons.RiArrowUpSFill style={iconColor} />,
      subNav: [
        {
          title: 'Waste-management',
          path: '/waste_management',
          icon: <AiFillDelete style={iconColor} /> 
        },
        {
          title: 'Number-plate-detection',
          path: '/number_plate_detection',
          icon: <AiOutlineCamera style={iconColor} /> 
        }
      ]
    },    
    {
      title: 'System Settings',
      path: '/system-setting',
      icon: <IoSettings style={iconColor} />
    },
    {
      title: 'Logout',
      onClick: logOutCall,
      icon: <IoLogOutOutline style={iconColor} />
    }
  ];
  return SidebarData;
};

export default SidebarDataPage;
