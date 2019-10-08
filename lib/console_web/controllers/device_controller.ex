defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Channels
  alias Console.Devices.Device
  alias Console.Devices.DevicesChannels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_team =
      conn.assigns.current_team
      |> Console.Teams.fetch_assoc([:devices])

    render(conn, "index.json", devices: current_team.devices)
  end

  def create(conn, %{"device" => device_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    device_params = Map.merge(device_params, %{"team_id" => current_team.id})

    with {:ok, %Device{} = device} <- Devices.create_device(device_params) do
      broadcast(device, "new")

      conn
      |> put_status(:created)
      |> put_resp_header("location", device_path(conn, :show, device))
      |> render("show.json", device: device)
    end
  end

  def show(conn, %{"id" => id}) do
    device =
      Devices.get_device!(id)
      |> Devices.fetch_assoc([:events])
    render(conn, "show.json", device: device)
  end

  def update(conn, %{"id" => id, "device" => device_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do

      conn
      |> put_resp_header("message", "#{device.name} updated successfully")
      |> render("show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.delete_device(device) do
      broadcast(device, "delete")
      conn
      |> put_resp_header("message", "#{device.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def set_channel(conn, %{"channel" => %{"id" => channel_id}, "device_id" => id}) do
    device = Devices.get_device!(id)
    channel = Channels.get_channel!(channel_id)

    with {:ok, %DevicesChannels{}} <- Devices.set_device_channel(device, channel) do
      # broadcast something

      conn
      |> put_resp_header("message", "#{device.name} updated channel successfully")
      |> render("show.json", device: device)
    end
  end

  defp broadcast(%Device{} = device, _) do
    device = Devices.fetch_assoc(device, [:team])

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device, device_added: "#{device.team.id}/device_added")
  end
end
