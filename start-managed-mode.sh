DEVICE=$1

if [ "$DEVICE" = "" ]; then
  DEVICE="wlo1"
fi

DEVICE="${DEVICE}mon"

sudo airmon-ng check kill
sudo airmon-ng stop $DEVICE

sudo service NetworkManager restart