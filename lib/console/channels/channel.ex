defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  alias Console.Organizations.Organization
  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Labels.ChannelsLabels

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: true
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :downlink_token, :string

    belongs_to :organization, Organization
    many_to_many :labels, Label, join_through: ChannelsLabels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["type", "name"])

    channel
    |> cast(attrs, [:name, :type, :active, :credentials, :organization_id])
    |> validate_required([:name, :type, :active, :credentials, :organization_id])
    |> validate_inclusion(:type, ~w(http mqtt aws azure google))
    |> put_change(:encryption_version, Cloak.version)
    |> check_credentials()
    |> put_type_name()
    |> put_downlink_token()
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This name has already been used in this organization")
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
  end

  def update_changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    channel
    |> cast(attrs, [:name, :credentials, :downlink_token])
    |> validate_required([:name, :type, :credentials])
    |> check_credentials_update(channel.type)
    |> put_downlink_token()
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This name has already been used in this organization")
  end

  defp put_type_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: type}} ->
        type_name =
          case type do
            "aws" -> "AWS IoT"
            "azure" -> "Azure IoT Hub"
            "google" -> "Google Cloud IoT Core"
            "mqtt" -> "MQTT"
            "http" -> "HTTP"
          end

        put_change(changeset, :type_name, type_name)
      _ -> changeset
    end
  end

  defp put_downlink_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http"}} ->
        token = generate_token(32)
        put_change(changeset, :downlink_token, token)
      %Ecto.Changeset{valid?: true, changes: %{downlink_token: "new"}, data: %Channel{type: "http"}} ->
        token = generate_token(32)
        put_change(changeset, :downlink_token, token)
      _ -> changeset
    end
  end

  defp check_credentials(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http", credentials: creds}} ->
        check_http_creds(changeset, creds)
      %Ecto.Changeset{valid?: true, changes: %{type: "mqtt", credentials: creds}} ->
        check_mqtt_creds(changeset, creds)
      _ -> changeset
    end
  end

  defp check_credentials_update(changeset, type) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{credentials: creds}} ->
        case type do
          "http" -> check_http_creds(changeset, creds)
          "mqtt" -> check_mqtt_creds(changeset, creds)
          _ -> changeset
        end
      _ -> changeset
    end
  end

  defp check_http_creds(changeset, creds) do
    uri = URI.parse(creds["endpoint"])
    case uri do
      %URI{scheme: scheme} when scheme != "http" and scheme != "https" -> add_error(changeset, :message, "URL scheme is invalid (ex: http/https)")
      %URI{host: nil} -> add_error(changeset, :message, "URL host is invalid (ex: helium.com)")
      uri -> put_change(changeset, :credentials, Map.merge(creds, %{"inbound_token" => generate_token(16)}))
    end
  end

  defp check_mqtt_creds(changeset, creds) do
    uri = URI.parse(creds["endpoint"])
    case uri do
      %URI{scheme: scheme} when scheme != "mqtt" and scheme != "mqtts" -> add_error(changeset, :message, "Endpoint scheme is invalid (ex: mqtt/mqtts)")
      %URI{host: nil} -> add_error(changeset, :message, "Endpoint host is invalid (ex: m1.helium.com)")
      _ ->
        cond do
          Regex.match?(~r/ /, creds["uplink"]["topic"]) or
          Regex.match?(~r/ /, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not have spaces")

          Regex.match?(~r/\/\//, creds["uplink"]["topic"]) or
          Regex.match?(~r/\/\//, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not have consecutive /")

          Regex.match?(~r/^\//, creds["uplink"]["topic"]) or
          Regex.match?(~r/^\//, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not start with a forward slash")

          Regex.match?(~r/\/$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\/$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not end with a forward slash")

          Regex.match?(~r/\#.*\#/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\#.*\#/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should only have 1 # if used")

          Regex.match?(~r/\#.+$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\#.+$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should end with # if # is used")

          Regex.match?(~r/[^\/]\#$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/[^\/]\#$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should end with # if # is used")

          Regex.match?(~r/[^\/]\#$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/[^\/]\#$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should end with /# if # is used")

          Regex.match?(~r/^\#$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/^\#$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not just be #")

          Regex.match?(~r/^\+$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/^\+$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should not just be +")

          Regex.match?(~r/[^\/]\+$/, creds["uplink"]["topic"]) or
          Regex.match?(~r/[^\/]\+$/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should have / in front of + if + is used at the end")

          Regex.match?(~r/[^\/]+\+/, creds["uplink"]["topic"]) or
          Regex.match?(~r/[^\/]+\+/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should have / in front and after + if + is used in the middle")

          Regex.match?(~r/\+[^\/]+/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\+[^\/]+/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic should have / in front and after + if + is used in the middle")

          Regex.match?(~r/\{.*\{.*\{/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\{.*\{.*\{/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic must close double curly braces properly, and only use the following 4 variables (device_id, device_eui, app_eui, organization_id).")

          Regex.match?(~r/\}.*\}.*\}/, creds["uplink"]["topic"]) or
          Regex.match?(~r/\}.*\}.*\}/, creds["downlink"]["topic"]) -> add_error(changeset, :message, "Topic must close double curly braces properly, and only use the following 4 variables (device_id, device_eui, app_eui, organization_id).")

          true ->
            up_topic_ok = check_topic(creds["uplink"]["topic"])
            down_topic_ok = check_topic(creds["downlink"]["topic"])

            if up_topic_ok and down_topic_ok do
              changeset
            else
              add_error(changeset, :message, "Topic must close double curly braces properly, and only use the following 4 variables (device_id, device_eui, app_eui, organization_id).")
            end
        end
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end

  defp check_topic(topic_string) do
    list = String.split(topic_string, ["{{","}}"])
    if rem(length(list), 2) == 1 do
      variable_names =
        for i <- 0..(length(list) - 1) do
          if rem(i, 2) == 1 do
            Enum.at(list, i)
          else
            nil
          end
        end
      variable_names = Enum.filter(variable_names, fn x -> x != nil end)

      Enum.reduce(variable_names, true, fn x, acc ->
        Enum.member?(["device_id", "device_eui", "app_eui", "organization_id"], x) && acc
      end)
    else
      false
    end
  end
end
