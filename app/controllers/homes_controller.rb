class HomesController < ApplicationController
    def index
    end

    def inventory
        url = "http://steamcommunity.com/inventory/#{params[:userID]}/#{params[:appID]}/2?l=english&count=5000"

        response = HTTParty.get(url)
        render json: {error: response.code} if response.code != 200

        reply = JSON.parse(response.body)
        render json: reply
    end
end