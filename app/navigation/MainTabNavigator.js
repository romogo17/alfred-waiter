import React from 'react'
import { Platform } from 'react-native'
import {
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation'

import TabBarIcon from '../components/TabBarIcon'
import HomeScreen from '../screens/HomeScreen'
import MenuScreen from '../screens/MenuScreen'
import BillScreen from '../screens/BillScreen'

const HomeStack = createStackNavigator({
  Home: HomeScreen
})

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-qr-scanner${focused ? '' : '-outline'}`
          : 'md-qr-scanner'
      }
    />
  )
}

const MenuStack = createStackNavigator({
  Menu: MenuScreen
})

MenuStack.navigationOptions = {
  tabBarLabel: 'Menu',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-book${focused ? '' : '-outline'}`
          : 'md-book'
      }
    />
  )
}

const BillStack = createStackNavigator({
  Bill: BillScreen
})

BillStack.navigationOptions = {
  tabBarLabel: 'Bill',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-cash${focused ? '' : '-outline'}`
          : 'md-cash'
      }
    />
  )
}

export default createBottomTabNavigator({
  HomeStack,
  MenuStack,
  BillStack
})
