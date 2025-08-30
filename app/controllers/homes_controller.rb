class HomesController < ApplicationController
    def index; end

    def inventory
      @user_id = params[:userID]
      @app_id = params[:appID]

      render json: get_items.to_json
    end

    private

    def get_items(start_assetid = nil)
      url = if start_assetid.present?
        "http://steamcommunity.com/inventory/#{@user_id}/#{@app_id}/2?l=english&count=2000&start_assetid=#{start_assetid}"
      else
        "http://steamcommunity.com/inventory/#{@user_id}/#{@app_id}/2?l=english&count=2000"
      end

      response = HTTParty.get(url)
      reply = JSON.parse(response.body)

      if reply["more_items"] == 1
        sleep(5)
        extra_data = get_items(reply["last_assetid"]) 
        reply["assets"] = reply["assets"] + extra_data["assets"]
        reply["descriptions"] = reply["descriptions"] + extra_data["descriptions"]
      end

      reply
    end
end
