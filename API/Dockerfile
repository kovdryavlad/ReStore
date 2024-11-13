FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app
EXPOSE 8080 

#copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

#copy everything else
COPY . ./

RUN dotnet publish -c Release -o out

#build a runtime image

FROM mcr.microsoft.com/dotnet/aspnet:8.0 as runtime
WORKDIR app/
COPY --from=build-env ./app/out .
ENTRYPOINT [ "dotnet", "API.dll" ]