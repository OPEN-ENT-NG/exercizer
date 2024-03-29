#!/bin/bash

if [ ! -e node_modules ]
then
  mkdir node_modules
fi

case `uname -s` in
  MINGW* | Darwin*)
    USER_UID=1000
    GROUP_UID=1000
    ;;
  *)
    if [ -z ${USER_UID:+x} ]
    then
      USER_UID=`id -u`
      GROUP_GID=`id -g`
    fi
esac
GIT_BRANCH="feat-explorer"
# options
SPRINGBOARD="recette"
for i in "$@"
do
case $i in
    -s=*|--springboard=*)
    SPRINGBOARD="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

clean () {
  gradle clean
}

buildNode () {
  #try jenkins branch name => then local git branch name => then jenkins params
  echo "[buildNode] Get branch name from jenkins env..."
  BRANCH_NAME=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  if [ "$BRANCH_NAME" = "" ]; then
    echo "[buildNode] Get branch name from git..."
    BRANCH_NAME=`git branch | sed -n -e "s/^\* \(.*\)/\1/p"`
  fi
  if [ ! -z "$FRONT_TAG" ]; then
    echo "[buildNode] Get tag name from jenkins param... $FRONT_TAG"
    BRANCH_NAME="$FRONT_TAG"
  fi
  if [ "$BRANCH_NAME" = "" ]; then
    echo "[buildNode] Branch name should not be empty!"
    exit -1
  fi

  if [ "$BRANCH_NAME" = 'master' ] || [ "$BRANCH_NAME" = 'v3.6.1.x' ]; then
      echo "[buildNode] Use entcore version from package.json ($BRANCH_NAME)"
      case `uname -s` in
        MINGW*)
          npm install --no-bin-links && npm update entcore && node_modules/gulp/bin/gulp.js build
          ;;
        *)
          npm install && npm update entcore && node_modules/gulp/bin/gulp.js build --springboard=/home/node/$SPRINGBOARD
      esac
  else
      echo "[buildNode] Use entcore tag $BRANCH_NAME"
      case `uname -s` in
        MINGW*)
          npm install --no-bin-links && npm rm --no-save entcore && npm install --no-save entcore@$BRANCH_NAME && node_modules/gulp/bin/gulp.js build
          ;;
        *)
          npm install && npm rm --no-save entcore && npm install --no-save entcore@$BRANCH_NAME && node_modules/gulp/bin/gulp.js build --springboard=/home/node/$SPRINGBOARD
      esac
  fi
}

buildGradle () {
  gradle shadowJar install publishToMavenLocal
}

publish () {
  if [ -e "?/.gradle" ] && [ ! -e "?/.gradle/gradle.properties" ]
  then
    echo "odeUsername=$NEXUS_ODE_USERNAME" > "?/.gradle/gradle.properties"
    echo "odePassword=$NEXUS_ODE_PASSWORD" >> "?/.gradle/gradle.properties"
    echo "sonatypeUsername=$NEXUS_SONATYPE_USERNAME" >> "?/.gradle/gradle.properties"
    echo "sonatypePassword=$NEXUS_SONATYPE_PASSWORD" >> "?/.gradle/gradle.properties"
  fi
  gradle publish
}

watch () {
  node_modules/gulp/bin/gulp.js watch --springboard=/home/node/$SPRINGBOARD
}

for param in "$@"
do
  case $param in
    clean)
      clean
      ;;
    buildNode)
      buildNode
      ;;
    buildGradle)
      buildGradle
      ;;
    install)
      buildNode && buildGradle
      ;;
    watch)
      watch
      ;;
    publish)
      publish
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done

