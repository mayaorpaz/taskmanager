import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-react-native-sdk";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId: undefined,
      client: undefined
    };
    this._loadClient = this._loadClient.bind(this);
    this._onPressLogin = this._onPressLogin.bind(this);
    this._onPressLogout = this._onPressLogout.bind(this);
    this._onPressTest = this._onPressTest.bind(this);
  }

  componentDidMount() {
    this._loadClient();
  }

  render() {
    let loginStatus = "Currently logged out.";

    if (this.state.currentUserId) {
      loginStatus = `Currently logged in as ${this.state.currentUserId}!`;
    }

    loginButton = <Button onPress={this._onPressLogin} title="Login" />;

    logoutTest = <Button onPress={this._onPressTest} title="Test" />;

    logoutButton = <Button onPress={this._onPressLogout} title="Logout" />;

    logoutView = (
      <View>
        {logoutButton}
        {logoutTest}
      </View>
    );

    return (
      <View style={styles.container}>
        <Text> {loginStatus} </Text>
        {this.state.currentUserId !== undefined ? logoutView : loginButton}
      </View>
    );
  }

  _loadClient() {
    Stitch.initializeDefaultAppClient("taskmanager-hyxpx").then(client => {
      this.setState({ client });

      if (client.auth.isLoggedIn) {
        this.setState({ currentUserId: client.auth.user.id });
      }
    });
  }

  _onPressLogin() {
    this.state.client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        console.log(`Successfully logged in as user ${user.id}`);
        this.setState({ currentUserId: user.id });
      })
      .catch(err => {
        console.log(`Failed to log in anonymously: ${err}`);
        this.setState({ currentUserId: undefined });
      });
  }

  _onPressLogout() {
    this.state.client.auth
      .logout()
      .then(user => {
        console.log(`Successfully logged out`);
        this.setState({ currentUserId: undefined });
      })
      .catch(err => {
        console.log(`Failed to log out: ${err}`);
        this.setState({ currentUserId: undefined });
      });
  }

  _onPressTest() {
    const stitchAppClient = Stitch.defaultAppClient;
    const mongoClient = stitchAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    const db = mongoClient.db("taskmanager");
    const tasks = db.collection("tasks");
    tasks
      .updateOne(
        { author: this.state.currentUserId },
        { $set: { status: "new", description: "noDESC" } },
        { upsert: true }
      )
      .then(() =>
        tasks
          .find({ author: this.state.currentUserId }, { limit: 100 })
          .asArray()
      )
      .then(docs => {
        console.warn("Found docs", docs);
      })
      .catch(err => {
        console.warn(err);
      });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});

/*import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});*/
